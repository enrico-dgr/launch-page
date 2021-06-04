import { Browser } from 'puppeteer';

declare global {
  namespace NodeJS {
    interface Global {
      __BROWSER__: Browser;
    }
  }
}
