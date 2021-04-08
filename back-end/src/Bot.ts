import Teleteer from "./Teleteer/Teleteer";
import Instateer from "./Instateer/Instateer";
import { ElementHandle, Page } from "puppeteer";
import { telegramUrlToHttpUrl } from "./Teleteer/parsers";

import { transports } from "winston";
import logger from "./WinstonLogger/Winston";
import { ToXPath } from "./Teleteer/toPaths";

const thisLogger = logger("Socialgift");
thisLogger.add(
  new transports.File({
    filename: "follows.log",
    level: "silly",
  })
);
class Bot {
  constructor(tgPage: Page, igPage: Page) {
    this.profileName = "Socialgift";
    this.campaignButtonLink = "PARTECIPA";
    this.campaignButtonBottom = "🤑 GUADAGNA 🤑";
    this.campaignButtonConfirm = "CONFERMA";
    this.campaignButtonSkip = "SALTA";
    this.teleteer = new Teleteer(tgPage);
    this.instateer = new Instateer(igPage);
  }
  readonly profileName: string;
  readonly campaignButtonLink: string;
  readonly campaignButtonBottom: string;
  readonly campaignButtonConfirm: string;
  readonly campaignButtonSkip: string;
  working: boolean = false;
  readonly CYCLE_TIME = 2 * 30000;
  readonly teleteer: Teleteer;
  readonly instateer: Instateer;
  private errorLimit: number = 0;
  private initBot = async () => {
    await this.teleteer.init();
    await this.instateer.init();

    await this.teleteer.openDialog(this.profileName);
  };

  private campaignUrl = async () => {
    const buttonLinks = await this.teleteer.message.button.all.linkByProfileNameAndText(
      this.profileName,
      this.campaignButtonLink
    );

    return await this.teleteer.getPropertyAsString(
      buttonLinks[buttonLinks.length - 1],
      "href"
    );
  };
  private campaignUrlStories = async () => {
    const storiesUrl = await this.teleteer.checkReadyXPath(
      ToXPath.inMessage.instagramLink(
        this.profileName,
        "Partecipa alla Campagna"
      ),
      "No stories url"
    );
    return await this.teleteer.getPropertyAsString(
      storiesUrl[storiesUrl.length - 1],
      "href"
    );
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
    const parsedUrl = telegramUrlToHttpUrl(
      await this.campaignUrl().catch(() => this.campaignUrlStories())
    );
    await this.instateer.goToIgPage(parsedUrl);
    var instagramAction: string;
    var result: boolean | string | "skip" = false;
    if (
      (await this.teleteer.searchInElement(messageHandle, "Lascia un LIKE")) >
      -1
    ) {
      instagramAction = "like";
      result = await this.instateer.clickLike();
    } else if (
      (await this.teleteer.searchInElement(
        messageHandle,
        " Segui il Profilo"
      )) > -1
    ) {
      instagramAction = "follow";
      result = await this.instateer.clickFollow();
    } else if (
      (await this.teleteer.searchInElement(messageHandle, "Commento")) > -1
    ) {
      instagramAction = "comment";
      result = "skip";
    } else if (
      (await this.teleteer.searchInElement(
        messageHandle,
        "Visualizza Stories"
      )) > -1
    ) {
      instagramAction = "story";
      result = await this.instateer.visualizeStories();
    } else {
      instagramAction = "unknown";
      result = "skip";
      return;
    }

    if (result === true) {
      this.errorLimit = 0;
      await this.confirmCampaign()
        .then(() =>
          thisLogger.info("confirmed", {
            instagramAction: instagramAction,
            link: parsedUrl,
          })
        )
        .catch(() => thisLogger.error("failed to confirm"));
    } else if (result === "skip") {
      await this.skipCampaign();
      thisLogger.info(result, {
        instagramAction: instagramAction,
        link: parsedUrl,
        text: this.teleteer.getPropertyAsString(messageHandle, "innerText"),
      });
    } else if (typeof result === "string") {
      this.errorLimit++;
      if (this.errorLimit > 8) {
        throw new Error("8 errors in a row.");
      }
      thisLogger.error(result, { link: parsedUrl });
      await this.skipCampaign();
    } else thisLogger.error("No operation run");
  };
  private campaignInLastTen = async () => {
    const messages = (
      await this.teleteer.message.all.byProfileName(this.profileName)
    ).slice(-10);
    for (let i = messages.length - 1; i > -1; i--) {
      if (
        (await this.teleteer.searchInElement(
          messages[i],
          "Partecipa alla Campagna"
        )) > -1
      ) {
        return messages[i];
      }
    }
  };
  private routineBot = async () => {
    if (this.working === false) {
      this.working = true;

      const lastCampaign = await this.campaignInLastTen();
      if (lastCampaign !== undefined) {
        await this.doCampaign(lastCampaign);
      } else {
        await this.teleteer.bottomPanel.sendMessage(this.campaignButtonBottom);
      }
      this.working = false;
      return;
    }
  };

  startBot = async () => {
    await this.initBot();
    await this.routineBot();
    const timer = setInterval(this.routineBot, this.CYCLE_TIME);
  };
}
export default Bot;
