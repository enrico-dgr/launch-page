import Teleteer from "../Teleteer";
import Instateer from "../Instateer";
import { CampaignInfo, BrowserOpts } from "./Types";

import { ElementHandle, Page, launch } from "puppeteer";
import { telegramUrlToHttpUrl } from "../Teleteer/parsers";

import winston, { transports } from "winston";
import logger from "../WinstonLogger/Winston";
import { ToXPath } from "../Teleteer/toPaths";
import { containsText, getPropertyAsString } from "../Tooleteer";

class Bot {
  constructor(
    tgPage: Page,
    igPage: Page,
    botName: string,
    campaignInfo: CampaignInfo,
    speedMS?: number
  ) {
    this.teleteer = new Teleteer(tgPage);
    this.instateer = new Instateer(igPage);
    this.botName = botName;
    this.campaignInfo = campaignInfo;
    this.logger = logger(botName);
    if (speedMS !== undefined) {
      this.CYCLE_TIME = speedMS;
    }
  }

  //
  readonly teleteer: Teleteer;
  readonly instateer: Instateer;
  // tg-bot vars
  readonly botName: string;
  readonly campaignInfo: CampaignInfo;
  //
  working: boolean = false;
  readonly CYCLE_TIME = 3 * 30000;
  private errorLimit: number = 0;
  // logger
  readonly logger: winston.Logger;
  //
  static init = async (
    { userDataDir, headless }: BrowserOpts,
    botName: string,
    campaignInfo: CampaignInfo,
    speedMS?: number
  ) => {
    const browser = await launch({
      headless: headless,
      userDataDir: userDataDir,
      args: ["--lang=it"],
    });

    return new Bot(
      await browser.newPage(),
      await browser.newPage(),
      botName,
      campaignInfo,
      speedMS
    );
  };
  //
  private initBot = async () => {
    await this.teleteer.init();
    await this.instateer.init();
    this.logger.add(
      new transports.File({
        filename: "follows.log",
        level: "silly",
      })
    );

    await this.teleteer.openDialog(this.botName);
    await this.teleteer.page.waitForTimeout(1500);
  };

  private campaignUrlFromButton = async () => {
    const buttonLinks = await this.teleteer.message.button.all.linkByProfileNameAndText(
      this.botName,
      this.campaignInfo.button.link
    );

    return await this.teleteer.getPropertyAsString(
      buttonLinks[buttonLinks.length - 1],
      "href"
    );
  };

  private campaignUrl = async () => {
    for (let i = 0; i < this.campaignInfo.text.length; i++) {
      const text = this.campaignInfo.text[i];

      const storiesUrl = await this.teleteer
        .checkReadyXPath(
          ToXPath.messageWithText(this.botName, text) + `//a`,
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
    const { pre, post } = this.campaignInfo.comment;
    if (pre === undefined || post === undefined) {
      throw new Error("Pre and/or post comment not defined");
    }
    const start = innerText.search(pre);
    const end = innerText.search(post);
    if (start < 0 || end < 0) {
      return false;
    }
    return innerText.slice(start, end);
  };
  private confirmCampaign = async () => {
    await this.teleteer.page.bringToFront();
    const buttons = await this.teleteer.message.button.all.byProfileNameAndText(
      this.botName,
      this.campaignInfo.button.confirm
    );
    buttons[buttons.length - 1].click();
  };
  private skipCampaign = async () => {
    await this.teleteer.page.bringToFront();
    const buttons = await this.teleteer.message.button.all.byProfileNameAndText(
      this.botName,
      this.campaignInfo.button.skip
    );
    buttons[buttons.length - 1].click();
  };

  /**
   *
   * @param messageHandle
   */
  private doCampaign = async (messageHandle: ElementHandle<Element>) => {
    const parsedUrl = telegramUrlToHttpUrl(await this.campaignUrl());
    const { like, follow, comment, story } = this.campaignInfo;
    await this.instateer.goToIgPage(parsedUrl);
    var instagramAction: string;
    var result: boolean | string = false;

    if (await containsText(messageHandle, like)) {
      instagramAction = "like";
      result = await this.instateer.like.clickLike();
    } else if (await containsText(messageHandle, follow)) {
      instagramAction = "follow";
      result = await this.instateer.follow.clickFollow();
    } else if (
      comment.text !== undefined
        ? await containsText(messageHandle, comment.text)
        : "skip"
    ) {
      instagramAction = "comment";
      const innerText = await getPropertyAsString(messageHandle, "innerText");
      const comment = this.fetchSpecificComment(innerText);
      if (comment === false) {
        result = `No specific comment found`;
      } else {
        result = await this.instateer.sendComment(comment);
      }
    } else if (await containsText(messageHandle, story)) {
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
    for (let i = 0; i < this.campaignInfo.text.length; i++) {
      const text = this.campaignInfo.text[i];

      const messages = await this.teleteer.message.all
        .byProfileNameAndText(this.botName, text)
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
        await this.teleteer.bottomPanel.sendMessage(
          this.campaignInfo.button.bottom
        );
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
export * from "./Configs";
export * from "./Types";
