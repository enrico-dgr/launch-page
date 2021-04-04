import { Page } from "puppeteer";
import { TelegramSelectors, TelegramXPaths } from "./NodePaths";
import ConsoleLogWithTag from "./utils/ConsoleLogWithTag";
import { telegramUrlToHttpUrl } from "./utils/parsers";

class BotTelegram {
  /**
   * @param page tg-instance takes a (blank) page to open telegram profile
   */
  constructor(
    page: Page,
    linkPage: Page,
    BOT_NAME: string,
    BUTTON_LINK_TEXT: string,
    SKIP_MESSAGE: string
  ) {
    this.page = page;
    this.pageForUrlToOpen = linkPage;
    this.previousParsedUrl = "";
    this.BOT_NAME = BOT_NAME;
    this.BUTTON_LINK_TEXT = BUTTON_LINK_TEXT;
    this.SKIP_MESSAGE = SKIP_MESSAGE;
  }
  readonly page: Page;
  readonly pageForUrlToOpen: Page;
  previousParsedUrl: string;
  readonly BOT_NAME: string;
  readonly BUTTON_LINK_TEXT: string;
  readonly SKIP_MESSAGE: string;
  sameLinkCounter: number = 0;
  sameLinkCounterReducer = (actionType: "reset" | "add") => {
    switch (actionType) {
      case "reset":
        this.sameLinkCounter = 0;
        break;
      case "add":
        this.sameLinkCounter++;
        break;
      default:
        break;
    }
  };
  readonly counterMaxOldUrl: number = 25;
  readonly counterMaxNoAds: number = 40;
  /**
   * @name init
   * @description tg-instance goes to https://web.telegram.org/#/login
   * and clicks on bot chat link.
   * tg-instance writes '/visit'
   */
  init = async () => {
    const startBotTag = new ConsoleLogWithTag("startBot function: ");
    startBotTag.log("starting bot...");

    await this.page.bringToFront();
    await this.page.goto("https://web.telegram.org/#/login", {
      waitUntil: "load",
    });
    startBotTag.log("Page loaded");

    await this.openTelegramChat();
    await this.page.waitForNavigation();
    await this.writeVisit();

    startBotTag.log("bot started");
  };
  /**
   * @description tg-instance clicks on the chat pseudo-link of the bot
   */
  private openTelegramChat = async () => {
    const openTelegramChatTag = new ConsoleLogWithTag(
      "openTelegramChat function: "
    );

    await this.page.waitForXPath(TelegramXPaths.chatBot(this.BOT_NAME));
    const chatsHandle = this.page.$x(TelegramXPaths.chatBot(this.BOT_NAME));
    chatsHandle.then((chats) => chats[0].click());

    openTelegramChatTag.log("Chat opened");
  };
  /**
   * @description should run only if a chat is open, tg-instance goes
   * into the message text-box (a div with text) and types "/visit"
   * plus "Enter" as real Enter-key press, parsed with
   * "String.fromCharCode(13)".
   */
  private writeVisit = async () => {
    const writeVisitTag = new ConsoleLogWithTag("writeVisit function: ");

    await this.page.waitForSelector(TelegramSelectors.messageInput);
    await this.page.click(TelegramSelectors.messageInput);

    const keyEnter: string = String.fromCharCode(13);
    await this.page.keyboard.type("/visit" + keyEnter);

    writeVisitTag.log("/visit written");
  };
  /**
   * @name botRoutine
   * @param interval is the time inteval in milliseconds, argument of setInterval()
   * @returns () => setInterval()
   */
  botRoutine = (interval: number) =>
    setInterval(async () => {
      const urlToOpen = await this.findLastLink();
      if (urlToOpen !== "Old Url" && urlToOpen !== "No Url") {
        await this.pageForUrlToOpen.goto(urlToOpen.parsedUrl);
        await this.pageForUrlToOpen.bringToFront();
        console.log("loading page");
      } else {
        console.log(urlToOpen);
        console.log(this.sameLinkCounter);
        const isThereNewAd = await this.isNewAdAvailable();
        if (isThereNewAd === "No message") {
          console.log(isThereNewAd);
          return;
        }
        if (isThereNewAd && this.sameLinkCounter >= this.counterMaxOldUrl) {
          await this.clickSkipButton();
          this.sameLinkCounterReducer("reset");
        } else if (
          isThereNewAd === false &&
          this.sameLinkCounter >= this.counterMaxNoAds
        ) {
          await this.writeVisit();
          this.sameLinkCounterReducer("reset");
        }
      }
    }, interval);

  private findLastLink = async () => {
    const findLastLinkTag = new ConsoleLogWithTag("findLastLink function: ");

    this.sameLinkCounterReducer("add");

    const aHandle = await this.page
      .$x(TelegramXPaths.buttonLink(this.BUTTON_LINK_TEXT))
      .then((links) => links[links.length - 1]);
    if (!aHandle) {
      return "No Url";
    }
    const urlToParse = await aHandle
      .getProperty("href")
      .then((hrefHandle) =>
        hrefHandle?.jsonValue().then((href) => href as string)
      );
    if (!urlToParse) {
      return "No Url";
    }

    findLastLinkTag.log(urlToParse);
    const parsedUrl = telegramUrlToHttpUrl(urlToParse);
    findLastLinkTag.log(parsedUrl);
    if (this.previousParsedUrl === parsedUrl) {
      return "Old Url";
    } else {
      this.previousParsedUrl = parsedUrl;
      this.sameLinkCounterReducer("reset");
      return { urlToParse, parsedUrl };
    }
  };
  private clickSkipButton = async () => {
    await this.page.waitForXPath(TelegramXPaths.buttonSkip(this.SKIP_MESSAGE));
    await this.page
      .$x(TelegramXPaths.buttonSkip(this.SKIP_MESSAGE))
      .then((buttons) => buttons[buttons.length - 1].click());
  };
  private isNewAdAvailable = async () => {
    const isNewAdAvailableTag = new ConsoleLogWithTag(
      "isNewAdAvailable function: "
    );

    await this.page.waitForXPath(`//div[@class='im_message_text']`);
    const innerText = await this.page
      .$x(`//div[@class='im_message_text']`)
      .then((divs) => divs[divs.length - 1].getProperty("innerText"))
      .then((innterTextHandle) =>
        innterTextHandle?.jsonValue().then((innerText) => innerText as string)
      );
    if (!innerText) {
      return "No message";
    }

    if (
      innerText.search("Sorry, there are no new ads available.") > -1 ||
      innerText.search("Sorry, that task is no longer valid") > -1
    ) {
      isNewAdAvailableTag.log("No ads available");
      return false;
    } else return true;
  };
}

export default BotTelegram;
