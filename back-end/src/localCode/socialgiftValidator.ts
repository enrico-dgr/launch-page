import { pipe } from 'fp-ts/lib/function';
import P from 'puppeteer';
import { validator } from 'WebTeer/SocialGift/validator';

import { myProfiles } from './myProfiles';
import * as NU from './nodeUtils';
import { runAndLog } from './runAndLog';

/**
 * Main
 */
(async () => {
  const browser = await P.launch({
    headless: NU.headless(),
    userDataDir: NU.userDataDir,
    args: ["--lang=it"],
    defaultViewport: { width: 1050, height: 568 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  await pipe(
    { page },
    runAndLog(
      validator({
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
