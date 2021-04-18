import Teleteer from "./Teleteer";
import Instateer from "./Instateer";

import { ElementHandle, Page } from "puppeteer";
import { telegramUrlToHttpUrl } from "./Teleteer/parsers";

import winston, { transports } from "winston";
import logger from "./WinstonLogger/Winston";
import { ToXPath } from "./Teleteer/toPaths";
import { containsText, getPropertyAsString } from "./Tooleteer";

class Bot {
  constructor(
    tgPage: Page,
    igPage: Page,
    profileName: string,
    campaignText: string[],
    likeText: string,
    followText: string,
    commentText: string,
    beforeComment: string,
    afterComment: string,
    storyText: string,
    campaignButtonLink: string,
    campaignButtonBottom: string,
    campaignButtonConfirm: string,
    campaignButtonSkip: string,
    speedMS?: number
  ) {
    this.profileName = profileName;
    this.campaignText = campaignText;
    this.likeText = likeText;
    this.followText = followText;
    this.commentText = commentText;
    this.beforeComment = beforeComment;
    this.afterComment = afterComment;
    this.storyText = storyText;
    this.campaignButtonLink = campaignButtonLink;
    this.campaignButtonBottom = campaignButtonBottom;
    this.campaignButtonConfirm = campaignButtonConfirm;
    this.campaignButtonSkip = campaignButtonSkip;
    this.teleteer = new Teleteer(tgPage);
    this.instateer = new Instateer(igPage);
    this.logger = logger(profileName);
    if (speedMS !== undefined) {
      this.CYCLE_TIME = speedMS;
    }
  }
  // tg-bot vars
  readonly profileName: string;
  readonly campaignText: string[];
  readonly likeText: string;
  readonly followText: string;
  readonly commentText: string;
  readonly beforeComment: string;
  readonly afterComment: string;
  readonly storyText: string;
  readonly campaignButtonLink: string;
  readonly campaignButtonBottom: string;
  readonly campaignButtonConfirm: string;
  readonly campaignButtonSkip: string;
  //
  working: boolean = false;
  readonly CYCLE_TIME = 3 * 30000;
  readonly teleteer: Teleteer;
  readonly instateer: Instateer;
  private errorLimit: number = 0;
  // logger
  readonly logger: winston.Logger;
  private initBot = async () => {
    await this.teleteer.init();
    await this.instateer.init();
    this.logger.add(
      new transports.File({
        filename: "follows.log",
        level: "silly",
      })
    );

    await this.teleteer.openDialog(this.profileName);
    await this.teleteer.page.waitForTimeout(1500);
  };

  private campaignUrlFromButton = async () => {
    const buttonLinks = await this.teleteer.message.button.all.linkByProfileNameAndText(
      this.profileName,
      this.campaignButtonLink
    );

    return await this.teleteer.getPropertyAsString(
      buttonLinks[buttonLinks.length - 1],
      "href"
    );
  };

  private campaignUrl = async () => {
    for (let i = 0; i < this.campaignText.length; i++) {
      const text = this.campaignText[i];

      const storiesUrl = await this.teleteer
        .checkReadyXPath(
          ToXPath.messageWithText(this.profileName, text) + `//a`,
          "No stories url"
        )
        .catch(() => undefined);
      if (storiesUrl !== undefined) {
        return await this.teleteer.getPropertyAsString(
          storiesUrl[storiesUrl.length - 1],
          "href"
        );
      }
    }
    throw new Error("No campaign url found");
  };
  private fetchSpecificComment = (innerText: string) => {
    const start = innerText.search(this.beforeComment);
    const end = innerText.search(this.afterComment);
    if (start < 0 || end < 0) {
      return false;
    }
    return innerText.slice(start, end);
  };
  private confirmCampaign = async () => {
    await this.teleteer.page.bringToFront();
    const buttons = await this.teleteer.message.button.all.byProfileNameAndText(
      this.profileName,
      this.campaignButtonConfirm
    );
    buttons[buttons.length - 1].click();
  };
  private skipCampaign = async () => {
    await this.teleteer.page.bringToFront();
    const buttons = await this.teleteer.message.button.all.byProfileNameAndText(
      this.profileName,
      this.campaignButtonSkip
    );
    buttons[buttons.length - 1].click();
  };

  /**
   *
   * @param messageHandle
   */
  private doCampaign = async (messageHandle: ElementHandle<Element>) => {
    const parsedUrl = telegramUrlToHttpUrl(await this.campaignUrl());
    await this.instateer.goToIgPage(parsedUrl);
    var instagramAction: string;
    var result: boolean | string = false;

    if (await containsText(messageHandle, this.likeText)) {
      instagramAction = "like";
      result = await this.instateer.like.clickLike();
    } else if (await containsText(messageHandle, this.followText)) {
      instagramAction = "follow";
      result = await this.instateer.follow.clickFollow();
    } else if (await containsText(messageHandle, this.commentText)) {
      instagramAction = "comment";
      const innerText = await getPropertyAsString(messageHandle, "innerText");
      const comment = this.fetchSpecificComment(innerText);
      if (comment === false) {
        result = `No specific comment found`;
      } else {
        result = await this.instateer.sendComment(comment);
      }
    } else if (await containsText(messageHandle, this.storyText)) {
      instagramAction = "story";
      result = await this.instateer.visualizeStories();
    } else {
      instagramAction = "unknown";
      result = false;
    }

    if (result === true) {
      this.errorLimit = 0;
      await this.confirmCampaign()
        .then(() =>
          this.logger.info("confirmed", {
            instagramAction: instagramAction,
            link: parsedUrl,
          })
        )
        .catch(() => this.logger.error("failed to confirm"));
    } else if (result === false) {
      await this.skipCampaign();

      this.logger.info("skip", {
        instagramAction: instagramAction,
        link: parsedUrl,
        text: await getPropertyAsString(messageHandle, "innerText"),
      });
    } else if (typeof result === "string") {
      this.errorLimit++;
      this.logger.error(result, { link: parsedUrl });
      if (this.errorLimit > 8) {
        throw new Error("8 errors in a row.");
      }
      await this.skipCampaign();
    } else {
      this.logger.error("No operation run");
      this.errorLimit++;
      if (this.errorLimit > 8) {
        throw new Error("8 errors in a row.");
      }
    }
  };
  private lastCampaign = async () => {
    for (let i = 0; i < this.campaignText.length; i++) {
      const text = this.campaignText[i];

      const messages = await this.teleteer.message.all
        .byProfileNameAndText(this.profileName, text)
        .catch(() => undefined);
      if (messages !== undefined) {
        return messages[messages.length - 1];
      }
    }
  };

  private routine = async () => {
    if (this.working === false) {
      this.working = true;
      // job
      const lastCampaign = await this.lastCampaign();
      if (lastCampaign !== undefined) {
        await this.doCampaign(lastCampaign);
      } else {
        await this.teleteer.bottomPanel.sendMessage(this.campaignButtonBottom);
      }
      //
      // let new campaign load
      await this.teleteer.page.waitForTimeout(500);
      this.working = false;
      return;
    }
  };

  start = async () => {
    await this.initBot();
    await this.routine();
    const timer = setInterval(this.routine, this.CYCLE_TIME);
  };
}
export default Bot;
