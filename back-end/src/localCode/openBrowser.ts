import P from 'puppeteer';
import * as Telegram from 'src/Applications/Telegram/index';

import * as NU from './nodeVariablesForPuppeteer';

//waverener12
//newmener2
(async () => {
  const browser = await P.launch({ ...NU.launchOptions, headless: false });
  const page = await browser.newPage();
  await page.goto(Telegram.settingsByLanguage.it.urls.base.href);
})();
