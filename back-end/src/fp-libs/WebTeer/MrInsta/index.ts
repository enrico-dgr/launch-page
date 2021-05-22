import { flow } from "fp-ts/lib/function";
import { WebDeps } from "..";
import { ElementHandle, JSHandle } from "puppeteer";

export const XPaths = {
  followProfilesList: `//div[@class='follow-profiles-list']`,
  /**
   * "activate free followers plan" button
   */
  actFFPButton: `//div[contains(.,'Free Followers')]/*/*/*/button[@type='submit' and @class='btn btn-primary red']`,
  primaryFollow: `//a[@class='btn btn-primary' and contains(.,'Follow Profile')]`,
  successConfirm: `//button[@class='btn btn-success' and contains(.,'Confirm')]`,
};
export const Selectors = {};
export const Urls = {
  base: new URL("https://www.instagram.com"),
  genericPost: new URL("https://www.instagram.com/p"),
  directInbox: new URL("https://www.instagram.com/direct/inbox/"),
};
