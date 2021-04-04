const puppeteer = require("puppeteer");
import { Browser } from "puppeteer";

import Bot from "./Bot";

(async () => {
  // Starting browser
  const browser: Browser = await puppeteer.launch({
    headless: true,
    userDataDir: "../userDataDir",
    args: ["--lang=it"],
  });

  const socialgift = new Bot(
    await browser.newPage(),

    await browser.newPage()
  );
  socialgift.startBot();
})();
