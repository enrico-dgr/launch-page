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
  // const socialgift = new newBot(
  //   await browser.newPage(),
  //   await browser.newPage(),
  //   "Socialgift",
  //   ["Partecipa alla Campagna"],
  //   "Lascia un LIKE",
  //   " Segui il Profilo",
  //   "Commento",
  //   "Visualizza Stories",
  //   "PARTECIPA",
  //   "🤑 GUADAGNA 🤑",
  //   "CONFERMA",
  //   "SALTA"
  // );
  // await socialgift.start();
  const socialmoney = new newBot(
    await browser.newPage(),
    await browser.newPage(),
    "Social Money",
    ["Partecipa alla Campagna", "Guarda la Storia"],
    "Lascia un LIKE",
    "fake string", //" Segui il Profilo",
    "Commento Specifico al post",
    "Commenta con il seguente testo: ",
    "\\n",
    "Guarda la Storia",
    "PARTECIPA",
    "🤑 GUADAGNA 🤑",
    "CONFERMA",
    "SALTA",
    61000
  );
  await socialmoney.start();
})();
