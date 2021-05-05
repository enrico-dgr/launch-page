import { ElementHandle } from "puppeteer";

export class ElementHandleTools {
  static getPropertyValue = async <T>(
    elementHandle: ElementHandle<Element>,
    propertyName: string
  ) => {
    const jshandle = await elementHandle.getProperty(propertyName);
    if (jshandle === undefined) {
      throw new Error(
        `Property:` + `\n  ${propertyName}\n` + `not found in elementHandle.`
      );
    }
    return jshandle?.jsonValue<T>();
  };
  /**
   *
   * @param elementHandle
   * @param text
   * @returns `element.innerText.search(text)`
   */
  static searchText = async (
    elementHandle: ElementHandle<Element>,
    text: string | RegExp
  ) =>
    ElementHandleTools.getPropertyValue<string>(
      elementHandle,
      "innerText"
    ).then((value) => value.search(text));
  /**
   *
   * @param elementHandle
   * @param text
   * @returns Promise which will resolve on true if contains text, false otherwise
   */
  static containsText = async (
    elementHandle: ElementHandle<Element>,
    text: string | RegExp
  ) => {
    const position = await ElementHandleTools.searchText(elementHandle, text);
    if (position > -1) {
      return true;
    } else return false;
  };
}
