import P from "puppeteer";
//waverener12
//newmener2
(async () => {
  const browser = await P.launch({
    headless: false,
    // userDataDir: "./userDataDirs/folders/newmener2",
    userDataDir: "./userDataDirs/folders/waverener12",
    args: ["--lang=it"],
    defaultViewport: { width: 1350, height: 768 },
  });
  // const page = await browser.newPage();
  // await page.goto("https://www.instagram.com");
  const page2 = await browser.newPage();
  await page2.goto("https://www.instagram.com/");
  // await page2.goto("https://app.mrinsta.com/");
})();
