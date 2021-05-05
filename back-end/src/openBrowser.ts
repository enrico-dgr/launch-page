import P from "puppeteer";

(async () => {
  const browser = await P.launch({
    headless: false,
    userDataDir: "./userDataDirs/newmener2",
    args: ["--lang=it"],
  });
  const page = await browser.newPage();
  await page.goto("https://www.instagram.com");
  const page2 = await browser.newPage();
  await page2.goto("https://app.mrinsta.com/");
})();
