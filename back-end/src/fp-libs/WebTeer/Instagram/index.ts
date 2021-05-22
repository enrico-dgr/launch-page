import { ElementHandle } from "puppeteer";
import { WebDeps, waitFor$x } from "..";
import { click } from "../ElementHandle";
import * as Follow from "./Follow";
const profilePageXPaths = {
  followed: {
    link: `//a[@class='-nal3 ' and contains(.,' profili seguiti')]`,
    follow: `//ul/div/li/div/div/button[text()='Segui']`,
    unfollow: `//ul/div/li/div/div/button[text()='Segui già']`,
    ul: `//ul[./div/li/div/div/button[contains(.,'Segui')]]`,
    divUl: `//div[./ul/div/li/div/div/button[contains(.,'Segui')]]`,
  },
  follow: {
    public: `//div[1]/div[1]/div/div/div/span/span[1]/button[contains(.,'Segui')]`,
    private: `//section/div/div/div/div/button[contains(.,'Segui')]`,
    official: `//section/div/div/div/div/div/span/span/button[contains(.,'Segui')]`,
    already: `//button[./div/span[@aria-label='Segui già']]`,
  },
};
const Selectors = {};
const Urls = {
  base: new URL("https://www.instagram.com"),
  genericPost: new URL("https://www.instagram.com/p"),
  directInbox: new URL("https://www.instagram.com/direct/inbox/"),
};

export const follow = {
  followedOfProfile: (msDelayBetweenFollows: number) =>
    Follow.fAF_fAFDeps({
      link_XPath_OR_selector: profilePageXPaths.followed.link,
      followFollowed_XPath_OR_selector: profilePageXPaths.followed.follow,
      unfollowFollowed_XPath_OR_selector: profilePageXPaths.followed.unfollow,
      scroller_XPath_OR_selector: profilePageXPaths.followed.divUl,
      getElementHandles: waitFor$x,
      click: click,
      msDelayBetweenFollows: msDelayBetweenFollows,
    }),
};
