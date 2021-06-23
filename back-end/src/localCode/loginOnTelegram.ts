import { pipe } from 'fp-ts/lib/function';
import P from 'puppeteer';
import { loginFromConsole } from 'WT-Telegram/index';

import * as NU from './nodeVariablesForPuppeteer';
import { runAndLog } from './runAndLog';

/**
 * Main
 */
(async () => {
  const browser = await P.launch({
    headless: JSON.parse(NU.options("--headless")()),
    userDataDir: `src/../userDataDirs/folders/${NU.variables("--user")()}`,
    args: ["--lang=it"],
    executablePath: NU.optionsExecutablePath(),
    defaultViewport: { width: 1050, height: 568 },
  });
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
