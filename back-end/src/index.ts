const puppeteer = require("puppeteer");
import { Browser } from "puppeteer";

import Bot from "./Bot";
import newBot from "./newBot";

(async () => {
  // Starting browser
  const browser: Browser = await puppeteer.launch({
    headless: true,
    userDataDir: "../userDataDir",
    args: ["--lang=it"],
  });

  // const socialgiftOld = new Bot(
  //   await browser.newPage(),

  //   await browser.newPage()
  // );
  // await socialgiftOld.startBot();
  const socialgift = new newBot(
    await browser.newPage(),
    await browser.newPage(),
    "Socialgift",
    ["Partecipa alla Campagna"],
    "Lascia un LIKE",
    " Segui il Profilo",
    "",
    "Commento",
    "",
    "Visualizza Stories",
    "PARTECIPA",
    "🤑 GUADAGNA 🤑",
    "CONFERMA",
    "SALTA"
  );
  const url = "https://www.instagram.com/enrico_di_grazia98/";
  console.log(
    await socialgift.instateer.downloadPostedUserPhotos(
      url,
      `../photos/enrico_di_grazia98`
    )
  );
  // await socialgift.start();
  await browser.close();
})();
