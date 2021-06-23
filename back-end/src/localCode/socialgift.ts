import { pipe } from 'fp-ts/lib/function';
import P from 'puppeteer';
import { actuator } from 'src/SocialGift';

import * as NU from './nodeVariablesForPuppeteer';
import { runAndLog } from './runAndLog';

/**
 * Main
 */
(async () => {
  const browser = await P.launch(NU.launchOptions);
  const page = await browser.newPage();
  page.setDefaultTimeout(JSON.parse(NU.options("--setDefaultTimeout")()));

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
