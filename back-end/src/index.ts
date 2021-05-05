import Bot, { scConfig } from "./Bot/index";

const config1 = scConfig("newmener1", false);
const config2 = scConfig("newmener2", false);
(async () => {
  const nmn1 = await Bot.init(
    config1.browserOpts,
    config1.botName,
    config1.campaignInfo
  );
  // const nmn2 = await Bot.init(
  //   config2.browserOpts,
  //   config2.botName,
  //   config2.campaignInfo
  // );

  // await socialgift.start();
})();
