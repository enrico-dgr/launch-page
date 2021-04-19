import { ElementHandle, Page } from "puppeteer";
import { ToXPath, ToSelector } from "./toPaths";
import fetch from "node-fetch";
import fs from "fs";
import logger from "../WinstonLogger/Winston";
import { getPropertyAsString } from "../Tooleteer";

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
  isOne = async (
    elements: ElementHandle<Element>[],
    elementNameForErrorMsg: string
  ) =>
    elements.length === 1
      ? elements[0]
      : "More than one " + elementNameForErrorMsg + " element or none";
  like = {
    /**
     *
     * @returns msg if none
     */
    checkStatus: async () => {
      const isLike = await this.page
        .waitForXPath(ToXPath.likeButton)
        .then(() => true)
        .catch(() => false);
      if (isLike) {
        return "like";
      }
      const isDislike = await this.page
        .waitForXPath(ToXPath.dislikeButton)
        .then(() => true)
        .catch(() => false);
      if (isDislike) {
        return "dislike";
      }
      return "No like/dislike button";
    },
    /**
     *
     * @returns 1) false if already liked
     * 2) true if clicked
     * 3) msg if none
     */
    clickLike: async () => {
      const status = await this.like.checkStatus();
      if (status === "dislike") {
        return false;
      } else if (status === "No like/dislike button") return status;
      const buttonOrError = await this.page
        .$x(ToXPath.likeButton)
        .then((buttons) => this.isOne(buttons, "like button"));
      if (typeof buttonOrError !== "string") {
        buttonOrError.click();
        return true;
      }
      return buttonOrError;
    },
  };
  waitForFollowType = async (XPath: string) =>
    this.page
      .waitForXPath(XPath)
      .then(() => XPath)
      .catch(() => false);
  thereIsFollowType = async (XPath: string) =>
    this.page
      .$x(XPath)
      .then(() => XPath)
      .catch(() => false);
  follow = {
    /**
     *
     * @returns 1) one of the XPaths on success
     * 2) false if already followed
     * 3) undefined if none
     */
    checkProfileType: async () => {
      var XPath: string | boolean;
      XPath = await this.waitForFollowType(ToXPath.followButton.publicProfile);

      if (typeof XPath === "string") {
        return XPath;
      }
      XPath = await this.thereIsFollowType(
        ToXPath.followButton.alreadyFollowed
      );
      if (typeof XPath === "string") {
        return false;
      }
      XPath = await this.thereIsFollowType(
        ToXPath.followButton.officialProfile
      );
      if (typeof XPath === "string") {
        return XPath;
      }
      XPath = await this.thereIsFollowType(ToXPath.followButton.privateProfile);
      if (typeof XPath === "string") {
        return XPath;
      }
    },
    /**
     *
     * @returns 1) true if clicked
     * 2) false if already followed
     * 3) msg if none
     */
    clickFollow: async () => {
      const followButtonPath = await this.follow.checkProfileType();
      if (followButtonPath === false) {
        return false;
      } else if (followButtonPath === undefined)
        return "No follow/unfollow button";
      const buttonOrError = await this.page
        .$x(followButtonPath)
        .then((buttons) => this.isOne(buttons, "follow button"));
      if (typeof buttonOrError !== "string") {
        buttonOrError.click();
        return true;
      }
      return buttonOrError;
    },
  };
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
  sendMessage = async (XPath: string, text: string) =>
    await this.page.waitForXPath(XPath).then((textarea) => {
      const keyEnter: string = String.fromCharCode(13);
      textarea?.type(text + keyEnter, { delay: 100 });
    });

  /**
   *
   * @param comment
   * @description find a comment textarea and send text
   */
  sendComment = async (comment: string) =>
    await this.sendMessage(ToXPath.commentTextarea, comment)
      .then(() => true)
      .catch(() => `Can't write comment`);
  visualizeStories = async () =>
    await this.page
      .waitForSelector(ToSelector.stories.container)
      .then(
        async () =>
          await this.page
            .$x(ToXPath.stories.watch_asButton)
            .then((buttons) =>
              buttons[0].click().catch(() => "No story permission asked.")
            )
      )
      .then(async (err) => {
        if (typeof err === "string") {
          return err;
        }
        await this.page.waitForTimeout(15 * 1000);
        return true;
      })
      .catch(() => `No story to visualize`);
  /**
   *
   * @param profileUrl
   * @param photosPath
   * @returns
   * 1) true if all downloaded
   * 2) string msg if error
   */
  downloadPostedUserPhotos = async (profileUrl: string, photosPath: string) => {
    await this.page.goto(profileUrl);
    //
    // shot posted photos
    const showPosts = await this.page
      .waitForXPath(ToXPath.profilePostsButtonLink)
      .then((btn) => btn?.click)
      .catch(() => "No Post button");
    //
    if (typeof showPosts === "string") {
      return showPosts;
    }
    // find photos
    await this.page.waitForXPath(ToXPath.profilePostedPhotos);
    let photos = await this.page.$x(ToXPath.profilePostedPhotos);
    for (let i = 0; i < 4; i++) {
      await this.page.evaluate(() => window.scroll(0, 10000));
      await this.page.waitForTimeout(3000);
      let newPhotos = await this.page.$x(ToXPath.profilePostedPhotos);
      const lastUrl = await getPropertyAsString(
        photos[photos.length - 1],
        "src"
      );
      for (let j = 0; j < newPhotos.length; j++) {
        const url = await getPropertyAsString(newPhotos[j], "src");
        if (url === lastUrl) {
          j++;
          if (j === newPhotos.length) {
            break;
          }

          photos = photos.concat(newPhotos.slice(j));
          break;
        }
      }
    }

    if (photos.length === undefined) {
      return "No photos found";
    }
    const length = photos.length;
    //
    // save all photos
    for (let i = 0; i < length; i++) {
      const src = await getPropertyAsString(photos[i], "src");
      const response = await fetch(src);
      const photo = await response.buffer();
      fs.writeFile(`${photosPath}/photoN${i + 1}.jpg`, photo, (e) =>
        e === null ? undefined : console.log(e)
      );
      console.log(i + 1);
    }
    //
    return true;
  };
}

export default Instateer;
