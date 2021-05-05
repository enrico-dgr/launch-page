import { ElementHandle, Page, devices } from "puppeteer";
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
  goToPage = async (url: string) => {
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
  goToMainPage = async () => await this.goToPage("https://www.instagram.com");
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
  isAvailablePage = async () =>
    await this.waitForFollowType(ToXPath.notAvailablePage).then((res) => {
      if (res === false) {
        return true;
      }
      return false;
    });
  isPrivateProfile = async () =>
    await this.waitForFollowType(ToXPath.profileProperties.private).then(
      (res) => {
        if (res === false) {
          return false;
        }
        return true;
      }
    );
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
        const result = await buttonOrError
          .click()
          .then(() => true)
          .catch(() => `Follow button not clicked`);
        return result;
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
  postPhoto = async (imageSystemPath: string, description: string) => {
    const iPhone = devices["iPhone 6"];

    await this.page.emulate(iPhone);
    await this.page.reload();
    //
    let inputs = await this.page.$$('input[type="file"]');
    const input = inputs[inputs.length - 1];
    //
    const newPostButton = await this.page.waitForXPath(
      '//div[./*[@aria-label="Nuovo post"]]'
    );
    await newPostButton?.click();
    await this.page.waitForTimeout(250);

    // image check
    if (
      !(
        imageSystemPath.toLowerCase().endsWith("jpg") ||
        imageSystemPath.toLowerCase().endsWith("jpeg")
      )
    ) {
      throw new Error("Instagram only accepts jpeg/jpg images.");
    }

    if (!fs.existsSync(imageSystemPath)) {
      throw new Error("The image you specified does not exist.");
    }
    //
    await input.uploadFile(imageSystemPath);
    await this.page.waitForTimeout(250);
    //
    const nextButtonXPath = "//button[contains(text(),'Avanti')]";
    await this.page.waitForXPath(nextButtonXPath);
    let next = await this.page.$x(nextButtonXPath);
    await next[0].click();
    //
    const descriptionXPath = `//textarea[@aria-label='Scrivi una didascalia...']`;
    const textarea = await this.page.waitForXPath(descriptionXPath);
    await textarea?.click();
    await this.page.keyboard.type(description);
    //
    const shareButtonXPath = `//button[contains(text(),'Condividi')]`;
    await this.page.waitForXPath(shareButtonXPath);
    let share = await this.page.$x(shareButtonXPath);
    await share[0].click();
    //
    await this.page.emulate({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/90.0.4403.0 Safari/537.36",
      viewport: {
        width: 800,
        height: 600,
        // deviceScaleFactor: 2,
        // isMobile: false,
        // hasTouch: false,
        // isLandscape: false,
      },
    });
    await this.page.reload();
  };
  login = async (user: string, password: string) => {
    await this.page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
    );
    await this.goToPage("https://www.instagram.com");
    //

    await this.page.waitForSelector("input[name='username']");
    await this.page.waitForTimeout(250);
    const idInput = await this.page.$("input[name='username']");
    const passwordInput = await this.page.$("input[name='password']");
    //
    await idInput?.click();
    await this.page.keyboard.type(user);
    await passwordInput?.click();
    await this.page.keyboard.type(password);
    await this.page.waitForTimeout(250);
    //
    const buttons = await this.page.$x(`//button[contains(.,'Accedi')]`);
    const loginButton = buttons[0];
    await loginButton.click();
    await this.page.waitForNavigation();
  };
  logout = async () => {
    const profileMenuXPath = `//span[@role='link' and @tabindex='0']`;
    const profileMenu = await this.page.waitForXPath(profileMenuXPath);
    await profileMenu?.click();
    const exitXPath = `//div[contains(text(),'Esci')]`;
    const exitButton = await this.page.waitForXPath(exitXPath);
    await exitButton?.click();
  };
}

export default Instateer;
export * from "./postsMaterials";
