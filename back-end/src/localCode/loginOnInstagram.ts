import { pipe } from 'fp-ts/lib/function';
import P from 'puppeteer';
import { loginFromConsole } from 'WT-Instagram/index';

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
      loginFromConsole({
        language: "it",
      })
    )
  )();
})();
