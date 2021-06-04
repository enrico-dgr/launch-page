import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as P from 'puppeteer';

import * as _ from './index';

describe("Utils/ElementHandle", () => {
  const timeout = 5000;
  let page: P.Page;
  let inputSearch: P.ElementHandle;
  let linkGoogleStore: P.ElementHandle;
  let titleXPath = '//*[text()="Google"]';
  let title: P.ElementHandle[];
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

    title = await page.$x(titleXPath);
  }, timeout);
  describe("click", () => {
    it("right", async () => {
      await expect(
        pipe({ page }, _.click(inputSearch))()
      ).resolves.toStrictEqual(E.right<Error, void>(undefined));
    });
  });
  /**
   * getProperty
   */
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
  /**
   * isNElementArray
   */
  describe("isNElementArray", () => {
    it("right", async () => {
      await expect(
        pipe(
          { page },
          _.isNElementArray((n) => n === 1)(
            (els, r) => `Found "${els.length}" input elements at ${r.page.url}`
          )(title)
        )()
      ).resolves.toStrictEqual(E.right(title));
    });
    it("left", async () => {
      await expect(
        pipe(
          { page },
          _.isNElementArray((n) => n === 5)(
            (els, r) =>
              `Found "${els.length}" input(s) elements at ${r.page.url()}`
          )(title)
        )()
      ).resolves.toStrictEqual(
        E.left(
          new Error(`Found "1" input(s) elements at https://www.google.com/`)
        )
      );
    });
  });
  /**
   * evaluate
   */
  describe(`evaluate`, () => {
    it("right", async () => {
      await expect(
        pipe(
          { page },
          _.evaluate((el: HTMLElement) => el.textContent)(title[0])
        )()
      ).resolves.toStrictEqual(E.right("Google"));
    });
  });
  /**
   * innerTextMatcher
   */
  describe(`innerTextMatcher`, () => {
    describe("has", () => {
      it("right", async () => {
        await expect(
          pipe(
            { page },
            _.innerTextMatcher(true)(
              `Google`,
              (el, r) => `Title has not text "Google"`
            )(title[0])
          )()
        ).resolves.toStrictEqual(E.right(title[0]));
      });
      it("left", async () => {
        await expect(
          pipe(
            { page },
            _.innerTextMatcher(true)(
              `not contained phrase`,
              (el, r) => `Title has not text "not contained phrase"`
            )(title[0])
          )()
        ).resolves.toStrictEqual(
          E.left(new Error(`Title has not text "not contained phrase"`))
        );
      });
    });
    describe("has not", () => {
      it("right", async () => {
        await expect(
          pipe(
            { page },
            _.innerTextMatcher(false)(
              `not contained phrase`,
              (el, r) => `Title has text "not contained phrase"`
            )(title[0])
          )()
        ).resolves.toStrictEqual(E.right(title[0]));
      });
      it("left", async () => {
        await expect(
          pipe(
            { page },
            _.innerTextMatcher(false)(
              `Google`,
              (el, r) => `Title has text "Google"`
            )(title[0])
          )()
        ).resolves.toStrictEqual(E.left(new Error(`Title has text "Google"`)));
      });
    });
  });
});
