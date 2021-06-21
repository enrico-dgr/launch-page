import P from 'puppeteer';
import * as Telegram from 'src/Applications/Telegram/index';

import * as NU from './nodeVariablesForPuppeteer';

//waverener12
//newmener2
(async () => {
  const browser = await P.launch({
    headless: false,
    userDataDir: `src/../userDataDirs/folders/${NU.variables("--user")()}`,
    args: ["--lang=it"],
    executablePath: NU.optionsExecutablePath(),
    defaultViewport: { width: 1150, height: 868 },
  });
  const page = await browser.newPage();
  await page.goto(Telegram.settingsByLanguage.it.urls.base.href);
})();
