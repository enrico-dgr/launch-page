import { pipe } from 'fp-ts/lib/function';
import P from 'puppeteer';

import { actuator } from '../../examples/SocialGift/index';
import * as NU from './nodeVariablesForPuppeteer';
import * as NB from './nodeVariablesForSocialgiftBot';
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
        options: NB.optionsOfInput,
      })
    )
  )();
})();
