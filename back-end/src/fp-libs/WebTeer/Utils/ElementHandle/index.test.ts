import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as P from 'puppeteer';

import * as _ from './index';

describe("Utils/ElementHandle", () => {
  const timeout = 5000;
  let page: P.Page;
  let inputSearch: P.ElementHandle;
  let linkGoogleStore: P.ElementHandle;
  beforeAll(async () => {
    // page
    page = await global.__BROWSER__.newPage();
    await page.goto("https://google.com");
    //
    inputSearch =
      (await page.waitForXPath(`//input[@title='Cerca']`)) ??
      (() => {
        throw new Error("searchInput element is null");
      })();
    linkGoogleStore =
      (await page.waitForXPath(`//a[text()='Google Store']`)) ??
      (() => {
        throw new Error("linkGoogleStore element is null");
      })();
  }, timeout);
  describe("click", () => {
    it("right", async () => {
      await expect(
        pipe({ page }, _.click(inputSearch))()
      ).resolves.toStrictEqual(E.right<Error, void>(undefined));
    });
  });
  describe("getProperty", () => {
    it("href", async () => {
      await expect(
        pipe({ page }, _.getProperty<string>("href")(linkGoogleStore))()
      ).resolves.toStrictEqual(
        E.right<Error, string>(
          "https://store.google.com/IT?utm_source=hp_header&utm_medium=google_ooo&utm_campaign=GS100042&hl=it-IT"
        )
      );
    });
    it("origin", async () => {
      await expect(
        pipe(
          { page },
          _.getProperty<string, HTMLAnchorElement>("origin")(linkGoogleStore)
        )()
      ).resolves.toStrictEqual(
        E.right<Error, string>("https://store.google.com")
      );
    });
    it("class", async () => {
      await expect(
        pipe(
          { page },
          _.getProperty<string, HTMLElement>("className")(linkGoogleStore)
        )()
      ).resolves.toStrictEqual(E.right<Error, string>("MV3Tnb"));
    });
  });
});
