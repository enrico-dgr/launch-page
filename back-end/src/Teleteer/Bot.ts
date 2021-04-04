import Teleteer from "./Teleteer";
import { ElementHandle, Page } from "puppeteer";
import { telegramUrlToHttpUrl } from "./parsers";

import { transports } from "winston";
import logger from "./Winston";
import { ToXPath } from "./toPaths";

const thisLogger = logger("Socialgift");
thisLogger.add(
  new transports.File({
    filename: "follows.log",
    level: "silly",
  })
);
class Bot extends Teleteer {
  constructor(page: Page, igPage: Page) {
    super(page);
    this.profileName = "Socialgift";
    this.campaignButtonLink = "PARTECIPA";
    this.campaignButtonBottom = "🤑 GUADAGNA 🤑";
    this.campaignButtonConfirm = "CONFERMA";
    this.campaignButtonSkip = "SALTA";
    this.igPage = igPage;
  }
  readonly profileName: string;
  readonly campaignButtonLink: string;
  readonly campaignButtonBottom: string;
  readonly campaignButtonConfirm: string;
  readonly campaignButtonSkip: string;
  readonly igPage: Page;
  working: boolean = false;

  private goToIgPage = async (url: string) => {
    await this.igPage.bringToFront();
    return await this.igPage
      .goto(url, {
        waitUntil: "networkidle0",
      })
      .catch((reason) => {
        thisLogger.error(`Can't load ${url}`);
        return reason;
      });
  };

  private initBot = async () => {
    await this.init();
    this.igPage.setDefaultTimeout(15000);

    await this.openDialog(this.profileName);
  };

  private campaignUrl = async () => {
    const buttonLinks = await this.message.button.btnLinkAllByProfileNameAndText(
      this.profileName,
      this.campaignButtonLink
    );

    return await this.getPropertyAsString(
      buttonLinks[buttonLinks.length - 1],
      "href"
    );
  };
  private campaignUrlStories = async () => {
    const storiesUrl = await this.checkReadyXPath(
      ToXPath.inMessage.instagramLink(
        this.profileName,
        "Partecipa alla Campagna"
      ),
      "No stories url"
    );
    return await this.getPropertyAsString(
      storiesUrl[storiesUrl.length - 1],
      "href"
    );
  };
  private checkLike = async () =>
    this.igPage
      .waitForSelector(
        `section > span > button > div > span > svg[aria-label="Non mi piace più"]`
      )
      .then(() => thisLogger.debug("Already liked"))
      .then(() => true);

  private clickLike = async () => {
    const likeSelector = `section > span > button > div > span > svg[aria-label="Mi piace"]`;

    return await this.igPage
      .waitForSelector(likeSelector)
      .then((likeButton) => likeButton?.click())
      .then(() => true)
      .catch(() => this.checkLike().catch(() => `Can't click like`));
  };
  private checkPrivateFollow = async () =>
    this.igPage
      .waitForXPath(`//section/div[1]/div[1]/div/div/button`)
      .then(() => thisLogger.debug("private"))
      .then(() => true);
  private clickFollow = async () =>
    await this.igPage
      .waitForXPath("//div[1]/div[1]/div/div/div/span/span[1]/button")
      .then((followButton) => followButton?.click())
      .then(() => true)
      .catch(() => this.checkPrivateFollow().catch(() => `Can't click follow`));
  private visualizeStories = async () =>
    await this.igPage
      .waitForXPath(`//section/div[1]/div/section/div/div[2]`)
      .then(() =>
        this.igPage
          .$x(`//section/div/div[1]/div/div/div/div[3]/button`)
          .then((buttons) =>
            buttons[0]
              .click()
              .catch(() => thisLogger.debug("No story permission asked."))
          )
      )
      .then(() => this.igPage.waitForTimeout(15 * 1000))
      .then(() => true)
      .catch(() => `No story to visualize`);
  private confirmCampaign = async () => {
    await this.page.bringToFront();
    const buttons = await this.message.button.allByProfileNameAndText(
      this.profileName,
      this.campaignButtonConfirm
    );
    buttons[buttons.length - 1].click();
  };
  private skipCampaign = async () => {
    await this.page.bringToFront();
    const buttons = await this.message.button.allByProfileNameAndText(
      this.profileName,
      this.campaignButtonSkip
    );
    buttons[buttons.length - 1].click();
  };
  // "section > span > button > div > span > svg[aria-label='Mi piace']"
  existButtons = async () => {
    await this.igPage.waitForXPath(`//button`);
    await this.igPage
      .$x(`//button`)
      .then(async (buttons) => {
        buttons.map(async (button) => {
          if (
            (await button.evaluate(
              (btn: HTMLElement) => btn.parentElement?.tagName
            )) === "SPAN" &&
            (await button.evaluate(
              (btn: HTMLElement) => btn.parentElement?.parentElement?.tagName
            )) === "SECTION" &&
            (await button.evaluate(
              (btn: HTMLElement) => btn.firstElementChild?.tagName
            )) === "DIV" &&
            (await button.evaluate(
              (btn: HTMLElement) =>
                btn.firstElementChild?.firstElementChild?.tagName
            )) === "SPAN"
          ) {
            thisLogger.debug(
              await button.evaluate(
                (btn: HTMLElement) =>
                  `${btn.firstElementChild?.firstElementChild?.firstElementChild?.tagName}` +
                  `[aria-label='${btn.firstElementChild?.firstElementChild?.firstElementChild?.getAttribute(
                    "aria-label"
                  )}']`
              )
            );
          }
        });
      })
      .catch(() => thisLogger.error(`Can't load any like-button`));
  };
  /**
   *
   * @param messageHandle
   */
  private doCampaign = async (messageHandle: ElementHandle<Element>) => {
    const parsedUrl = telegramUrlToHttpUrl(
      await this.campaignUrl().catch(() => this.campaignUrlStories())
    );
    await this.goToIgPage(parsedUrl);
    // for debugging
    // await this.existButtons();
    var result: boolean | string = false;
    if ((await this.searchInElement(messageHandle, "Lascia un LIKE")) > -1) {
      thisLogger.info("like");
      result = await this.clickLike();
      if (result === true) thisLogger.info(parsedUrl);
    } else if (
      (await this.searchInElement(messageHandle, " Segui il Profilo")) > -1
    ) {
      thisLogger.info("follow");
      result = await this.clickFollow();
      if (result === true) thisLogger.info(parsedUrl);
    } else if ((await this.searchInElement(messageHandle, "Commento")) > -1) {
      await this.skipCampaign();
    } else if (
      (await this.searchInElement(messageHandle, "Visualizza Stories")) > -1
    ) {
      thisLogger.info("story");
      result = await this.visualizeStories();
      if (result === true) thisLogger.info(parsedUrl);
    } else {
      await this.skipCampaign();

      thisLogger.info("skip", {
        text: this.getPropertyAsString(messageHandle, "innerText"),
      });
      return;
    }

    if (result === true) {
      await this.confirmCampaign()
        .then(() => thisLogger.debug("confirmed"))
        .catch(() => thisLogger.error("failed to confirm"));
    } else if (typeof result === "string") {
      thisLogger.error(result, { link: parsedUrl });
      await this.skipCampaign();
    } else thisLogger.error("No operation run");
  };
  private campaignInLastFive = async () => {
    const messages = (
      await this.message.allByProfileName(this.profileName)
    ).slice(-5);
    for (let i = messages.length - 1; i > -1; i--) {
      if (
        (await this.searchInElement(messages[i], "Partecipa alla Campagna")) >
        -1
      ) {
        return messages[i];
      }
    }
  };
  private routineBot = async () => {
    if (this.working === false) {
      this.working = true;

      const lastCampaign = await this.campaignInLastFive();
      if (lastCampaign !== undefined) {
        await this.doCampaign(lastCampaign);
      } else {
        await this.bottomPanel.sendMessage(this.campaignButtonBottom);
      }
      this.working = false;
      return;
    }
  };

  startBot = async () => {
    await this.initBot();
    await this.routineBot();
    const timer = setInterval(this.routineBot, 6 * 60000);
  };
}
export default Bot;
