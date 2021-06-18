import { pipe } from 'fp-ts/lib/function';
import P from 'puppeteer';
import { actuator } from 'src/SocialGift';

import { myProfiles } from './myProfiles';
import { runAndLog } from './runAndLog';

const PROFILE = myProfiles.waverener12;
/**
 * Main
 */
(async () => {
  const browser = await P.launch({
    headless: false,
    userDataDir: `./userDataDirs/folders/${PROFILE}`,
    args: ["--lang=it"],
    defaultViewport: { width: 1050, height: 568 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  await pipe(
    { page },
    runAndLog(
      actuator({
        language: "it",
        nameOfBot: "Socialgift",
        options: {
          skip: {
            Follow: false,
            Like: false,
            Comment: true,
            WatchStory: false,
            Extra: true,
          },
        },
      })
    )
  )();
})();
