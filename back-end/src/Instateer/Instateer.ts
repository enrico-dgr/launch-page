import { Page } from "puppeteer";
import { ToXPath, ToSelector } from "./toPaths";
import logger from "../WinstonLogger/Winston";

const thisLogger = logger("Instateer");

class Instateer {
  constructor(page: Page) {
    this.page = page;
  }
  readonly page: Page;

  init = async () => {
    this.page.setDefaultTimeout(15000);
  };
  goToIgPage = async (url: string) => {
    await this.page.bringToFront();
    return await this.page
      .goto(url, {
        waitUntil: "networkidle0",
      })
      .catch((reason) => {
        thisLogger.error(`Can't load ${url}`);
        return reason;
      });
  };
  checkDislike = async () =>
    this.page
      .waitForSelector(ToSelector.dislikeButton)
      .then(() => thisLogger.debug("Already liked"))
      .then(() => true);
  clickLike = async () =>
    await this.page
      .waitForSelector(ToSelector.likeButton)
      .then(async (button) => {
        if (button === null) {
          return `No like button`;
        }
        return button?.click();
      })
      .then(() => true)
      .catch(() => this.checkDislike().catch(() => `Can't click like`));
  checkPrivateFollow = async () =>
    this.page
      .waitForXPath(ToXPath.followButton.privateProfile)
      .then((button) => button?.click())
      .then(() => thisLogger.debug("private"))
      .then(() => true);
  checkOfficialFollow = async () =>
    this.page
      .waitForXPath(ToXPath.followButton.officialProfile)
      .then((button) => button?.click())
      .then(() => thisLogger.debug("official"))
      .then(() => true);
  /**
   *
   * @description if the profile is already followed, because of same xPath,
   * the click will run. It won't be unfollow because you need to confirm the popup.
   */
  clickFollow = async () =>
    await this.page
      .waitForXPath(ToXPath.followButton.publicProfile)
      .then((button) => button?.click())
      .then(() => true)
      .catch(() => this.checkPrivateFollow())
      .catch(() => this.checkOfficialFollow())
      .catch(() => `Can't click follow`);
  visualizeStories = async () =>
    await this.page
      .waitForSelector(ToSelector.stories.container)
      .then(() =>
        this.page
          .$x(ToXPath.stories.watch_asButton)
          .then((buttons) =>
            buttons[0]
              .click()
              .catch(() => thisLogger.debug("No story permission asked."))
          )
      )
      .then(() => this.page.waitForTimeout(15 * 1000))
      .then(() => true)
      .catch(() => `No story to visualize`);

  // "section > span > button > div > span > svg[aria-label='Mi piace']"
  existButtons = async () => {
    await this.page.waitForXPath(`//button`);
    await this.page
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
}

export default Instateer;
