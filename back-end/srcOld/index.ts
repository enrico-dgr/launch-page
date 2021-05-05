import Bot, { scConfig } from "./Bot/index";

if (true) {
} else {
  const CONFIG = scConfig("newmener2", false);

  const PHOTO_PATH = (photoNumber: number) =>
    `../photos/enrico_di_grazia98/photoN${photoNumber}.jpg`;

  (async () => {
    const newmener = await Bot.init(
      CONFIG.browserOpts,
      CONFIG.botName,
      CONFIG.campaignInfo
    );
    await newmener.instateer.goToPage("https://www.instagram.com");
  })();
}
