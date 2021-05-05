import { ElementHandle } from "puppeteer";

/**
 *
 * @description returns the property as a string.
 *
 * **NOTE** The method throws if the referenced object is not stringifiable.
 */
export const getPropertyAsString = async (
  elementHandle: ElementHandle<Element>,
  propertyName: string
) =>
  (await elementHandle
    .getProperty(propertyName)
    .then((jshandle) => jshandle?.jsonValue())) as string;
export const searchInElement = async (
  elementHandle: ElementHandle<Element>,
  text: string | RegExp
) => (await getPropertyAsString(elementHandle, "innerText")).search(text);

/**
 *
 * @param elementHandle
 * @param text
 * @returns true if contains text, false otherwise
 */
export const containsText = async (
  elementHandle: ElementHandle<Element>,
  text: string | RegExp
) => {
  const position = await searchInElement(elementHandle, text);
  if (position > -1) {
    return true;
  } else return false;
};
