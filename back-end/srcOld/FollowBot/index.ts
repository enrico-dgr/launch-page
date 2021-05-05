import { launch, Page } from "puppeteer";
import Instateer from "../Instateer";

class FollowBot {
  constructor(page: Page) {
    this.instateer = new Instateer(page);
  }
  readonly instateer: Instateer;
  static init = async () => {
    const browser = await launch({
      userDataDir: "../userDataDir/genericUser",
      headless: false,
      args: ["--lang=it"],
    });
    return new FollowBot(await browser.newPage());
  };

  loginFollowLogout = async (
    username: string,
    password: string,
    profile: string
  ) => {
    await this.instateer.login(username, password);

    await this.instateer.goToPage(`https://www.instagram.com/${profile}`);
    await this.instateer.follow.clickFollow();

    await this.instateer.logout();
  };
}
