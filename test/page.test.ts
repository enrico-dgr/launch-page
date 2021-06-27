import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as P from 'puppeteer';

import * as ElH from '../src/ElementHandle';
import { anyToError } from '../src/ErrorInfos';
import * as _ from '../src/Page';
import * as WT from '../src/WebProgram';

describe("Utils/Page", () => {
  const timeout = 5000;
  let page: P.Page;
  let titleXPath = '//*[text()="Google"]';

  beforeAll(async () => {
    // page
    page = await global.__BROWSER__.newPage();
    await page.goto("https://google.com");
  }, timeout);
  /**
   * $x
   */
  describe("$x", () => {
    it("right not empty array", async () => {
      await expect(
        pipe(
          _.$x(titleXPath)(page),
          WT.chain((els) => ElH.getInnerText(els[0]))
        )({ page })()
      ).resolves.toEqual(E.right("Google"));
    });
    it("right empty Array", async () => {
      await expect(
        pipe({ page }, _.$x('//*[@class="randomClass"]')(page))()
      ).resolves.toEqual(E.right([]));
    });
    it("left bad XPath", async () => {
      await expect(
        pipe({ page }, _.$x("a bad XPath")(page))()
      ).resolves.toStrictEqual(
        await page.$x("a bad XPath").catch((err) => anyToError(err))
      );
    });
  });
});
