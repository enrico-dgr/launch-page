import { ElementHandle, Page } from "puppeteer";

import { toSelector, ToXPath } from "./toPaths";
import logger from "./Winston";

const thisLogger = logger("Teleteer");

/**
 * @description
 * Based of puppeteer library.
 * This class creates an instance providing methods to easily get or use elements of telegram web-page.
 *
 * 1) The constructor asks for puppeteer browser.newPage().
 *
 * 2) Then the init() method must be run to access your telegram profile.
 */
class Teleteer {
  /**
   * @param page "this" takes a page to open telegram profile
   */
  constructor(page: Page) {
    this.page = page;
  }
  readonly page: Page;

  protected setupPage = async (
    page: Page,
    url: string,
    errorMessage: string
  ) => {
    page.setDefaultTimeout(15000);
    await page.bringToFront().catch();

    return await page
      .goto(url, {
        waitUntil: "load",
      })
      .catch((reason) => {
        thisLogger.error(errorMessage);
        return reason;
      });
  };
  /**
   * @description "this" goes to https://web.telegram.org/#/login.
   * @todo If it's not already logged, it waits for OTP through console.
   * @returns A void Promise if successful. An any Promise with catch's 'reason' object.
   */
  init = async () => {
    const loginUrl = "https://web.telegram.org/#/login";
    this.setupPage(this.page, loginUrl, "Init can't load " + loginUrl);
  };

  /**
   * @param textToQuery text contained in the element
   * @param toXPath method of class ToXPath, it supplies with the xpath fulfilled with the textToQuery
   * @param errorMessage error logged if no element is found
   */
  protected checkXPath = async (
    textToQuery: string,
    toXPath: (textToQuery: string) => string,
    errorMessage: string
  ) => {
    const xPath = toXPath(textToQuery);
    const isAvailable = await this.page.waitForXPath(xPath);
    const promise = this.page.$x(xPath);
    if (isAvailable === null) {
      thisLogger.error(errorMessage);
    }
    return promise;
  };
  protected checkReadyXPath = async (xPath: string, errorMessage: string) => {
    const isAvailable = await this.page.waitForXPath(xPath);
    const promise = this.page.$x(xPath);
    if (isAvailable === null) {
      thisLogger.error(errorMessage);
    }
    return promise;
  };
  protected checkXPathInElement = async (
    textToQuery: string,
    elementHandle: ElementHandle<Element>,
    toXPath: (textToQuery: string) => string,
    errorMessage: string
  ) => {
    const xPath = toXPath(textToQuery);
    const result = await elementHandle.$x(xPath);

    if (result.length === 0) {
      thisLogger.error(errorMessage);
    }
    return result;
  };
  /**
   *
   * @param errorMessage `Multiple results: ${errorMessage}`
   * @param handle
   * @param callBackfn
   * @returns the return of the callback, void otherwise
   */
  protected checkSingleMatchAndDo = async (
    errorMessage: string,
    handle: ElementHandle<Element>[],
    callBackfn: (handle: ElementHandle<Element>) => Promise<void>
  ) => {
    if (handle.length === 1) {
      await callBackfn(handle[0]);
    } else {
      thisLogger.error(
        `Multiple results (${handle.length} results) -- ${errorMessage}`
      );
    }
  };
  protected checkSingleMatchAnd = {
    click: async (errorMessage: string, handle: ElementHandle<Element>[]) =>
      this.checkSingleMatchAndDo(errorMessage, handle, (handle) =>
        handle.click()
      ),
  };
  /**
   *
   * @description returns the property as a string.
   *
   * **NOTE** The method throws if the referenced object is not stringifiable.
   */
  getPropertyAsString = async (
    elementHandle: ElementHandle<Element>,
    propertyName: string
  ) =>
    (await elementHandle
      .getProperty(propertyName)
      .then((jshandle) => jshandle?.jsonValue())) as string;
  searchInElement = async (
    elementHandle: ElementHandle<Element>,
    text: string | RegExp
  ) =>
    (await this.getPropertyAsString(elementHandle, "innerText")).search(text);
  /**
   * @param profileName the name of the user/bot on telegram
   */
  dialogs = async (profileName: string) =>
    this.checkXPath(
      profileName,
      ToXPath.dialogLink,
      `Can't find dialog with profile name: ${profileName}`
    );
  /**
   * @param profileName the name of the user/bot on telegram
   */
  openDialog = async (profileName: string) =>
    this.checkSingleMatchAnd.click(
      `Dialog with profile name: ${profileName}`,
      await this.dialogs(profileName)
    );

  /**
   * @param profileName the name of the user/bot on telegram
   */
  message = {
    allByProfileName: async (profileName: string) =>
      this.checkXPath(
        profileName,
        ToXPath.message,
        `Can't find any message from: ${profileName}`
      ),
    lastByProfileName: async (profileName: string) =>
      this.message
        .allByProfileName(profileName)
        .then((messages) => messages[messages.length - 1]),
    allByProfileNameAndText: async (profileName: string, text: string) =>
      this.checkReadyXPath(
        ToXPath.messageWithText(profileName, text),
        `Can't find message with text: ${text}`
      ),
    button: {
      allByProfileNameAndText: async (
        profileName: string,
        buttonText: string
      ) =>
        this.checkReadyXPath(
          ToXPath.inMessage.replyButton(profileName, buttonText),
          `Can't find message button with text: ${buttonText}`
        ),
      btnLinkAllByProfileNameAndText: async (
        profileName: string,
        buttonText: string
      ) =>
        this.checkReadyXPath(
          ToXPath.inMessage.replyButtonLink(profileName, buttonText),
          `Can't find message button link with text: ${buttonText}`
        ),
    },
  };
  // messages = async (profileName: string) =>
  //   this.checkXPath(
  //     profileName,
  //     ToXPath.message,
  //     `Can't find any message from: ${profileName}`
  //   );
  // lastMessage = async (profileName: string) =>
  //   this.messages(profileName).then(
  //     (messages) => messages[messages.length - 1]
  //   );
  // messagesWithText = async (profileName: string, buttonText: string) =>
  //   this.checkReadyXPath(
  //     ToXPath.messageWithText(profileName, buttonText),
  //     `Can't find message with text: ${buttonText}`
  //   );
  /**
   * @param buttonText text contained in the button
   */
  // messageButtons = async (profileName: string, buttonText: string) =>
  //   this.checkReadyXPath(
  //     ToXPath.inMessage.replyButton(profileName, buttonText),
  //     `Can't find message button with text: ${buttonText}`
  //   );
  /**
   * @param buttonText text contained in the button
   */
  // messageButtonLinks = async (profileName: string, buttonText: string) =>
  //   this.checkReadyXPath(
  //     ToXPath.inMessage.replyButtonLink(profileName, buttonText),
  //     `Can't find message button link with text: ${buttonText}`
  //   );
  /**
   *
   * @param buttonText text contained in the button
   */
  bottomPanel = {
    bottomPanelButton: async (buttonText: string) =>
      this.checkXPath(
        buttonText,
        ToXPath.inBottomPanel.replyButton,
        `Can't find bottom panel button with text: ${buttonText}`
      ),
    showBottomPanel: async () =>
      this.checkSingleMatchAnd.click(
        `Bottom panel 'active composer keyboad' button`,
        await this.checkXPath(
          "",
          ToXPath.inBottomPanel.composerKeyboardButton,
          ``
        )
      ),
    clickBottomPanelButton: async (buttonText: string) =>
      this.checkSingleMatchAnd.click(
        `Bottom panel button with text: ${buttonText}`,
        await this.bottomPanel.bottomPanelButton(buttonText)
      ),
    sendMessage: async (text: string) => {
      await this.page.waitForSelector(toSelector.messageInput);
      await this.page.click(toSelector.messageInput);

      const keyEnter: string = String.fromCharCode(13);
      await this.page.keyboard.type(text + keyEnter, { delay: 100 });
    },
  };
  // bottomPanelButton = async (buttonText: string) =>
  //   this.checkXPath(
  //     buttonText,
  //     ToXPath.inBottomPanel.replyButton,
  //     `Can't find bottom panel button with text: ${buttonText}`
  //   );
  // showBottomPanel = async () =>
  //   this.checkSingleMatchAnd.click(
  //     `Bottom panel 'active composer keyboad' button`,
  //     await this.checkXPath(
  //       "",
  //       ToXPath.inBottomPanel.composerKeyboardButton,
  //       ``
  //     )
  //   );
  // clickBottomPanelButton = async (buttonText: string) =>
  //   this.checkSingleMatchAnd.click(
  //     `Bottom panel button with text: ${buttonText}`,
  //     await this.bottomPanelButton(buttonText)
  //   );
  // sendMessage = async (text: string) => {
  //   await this.page.waitForSelector(toSelector.messageInput);
  //   await this.page.click(toSelector.messageInput);

  //   const keyEnter: string = String.fromCharCode(13);
  //   await this.page.keyboard.type(text + keyEnter, { delay: 100 });
  // };
}

export default Teleteer;
