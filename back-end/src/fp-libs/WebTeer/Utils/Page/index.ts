import { Browser, ElementHandle, Page } from "puppeteer";
import * as WebTeer from "../..";
import * as E from "fp-ts/Either";
import { flow, pipe } from "fp-ts/lib/function";
/**
 * @param xPath
 * @returns Array or empty array.
 * @description Runs `page.waitForXPath` and then `page.$x`
 */
export const waitFor$x = (xPath: string) => (
  page: Page
): WebTeer.WebProgram<ElementHandle<Element>[]> =>
  pipe(
    WebTeer.of(undefined),
    WebTeer.fromTaskK(() => () =>
      page
        .waitForXPath(xPath)
        .then(() => undefined)
        .catch(() => undefined)
    ),
    WebTeer.chain(() => $x(xPath)(page))
  );
export const $x = (XPath: string) => (
  page: Page
): WebTeer.WebProgram<ElementHandle<Element>[]> =>
  WebTeer.fromTaskEither(() =>
    page
      .$x(XPath)
      .then((els) =>
        els !== undefined
          ? E.right(els)
          : E.left(new Error(`No element found at XPath ${XPath}`))
      )
      .catch((err) => E.left(WebTeer.anyToError(err)))
  );
/**
 * @param selector
 * @returns Array or empty array.
 * @description Runs `page.waitForSelector` and then `page.$$`
 */
export const waitFor$$ = (selector: string) => (
  page: Page
): WebTeer.WebProgram<ElementHandle<Element>[]> =>
  pipe(
    WebTeer.of(undefined),
    WebTeer.fromTaskK(() => () =>
      page
        .waitForSelector(selector)
        .then(() => undefined)
        .catch(() => undefined)
    ),
    WebTeer.chain(() => $$(selector)(page))
  );
export const $$ = (selector: string) => (
  page: Page
): WebTeer.WebProgram<ElementHandle<Element>[]> =>
  WebTeer.fromTaskEither(() =>
    page
      .$$(selector)
      .then((els) => E.right(els))
      .catch((err) => E.left(WebTeer.anyToError(err)))
  );
/**
 *
 */
export const goto = (url: string) => (page: Page): WebTeer.WebProgram<void> =>
  WebTeer.fromTaskEither(() =>
    page
      .goto(url)
      .then(() => E.right(undefined))
      .catch((err) => E.left(WebTeer.anyToError(err)))
  );
export const browser = (page: Page): WebTeer.WebProgram<Browser> =>
  WebTeer.of(page.browser());
export const openNewPage: (page: Page) => WebTeer.WebProgram<Page> = flow(
  browser,
  WebTeer.chainTaskK((b) => () => b.newPage())
);
/**
 *
 * @param url
 * @returns the new Page
 */
export const openNewPageToUrl: (
  url: string
) => (page: Page) => WebTeer.WebProgram<Page> = (url) =>
  flow(
    openNewPage,
    WebTeer.chain((page_) =>
      pipe(
        page_,
        goto(url),
        WebTeer.chain(() => WebTeer.of(page_))
      )
    )
  );
export const close: (page: Page) => WebTeer.WebProgram<void> = (page) =>
  WebTeer.fromTaskK(() => () => page.close())();
export const closeOtherPages: (page: Page) => WebTeer.WebProgram<Page> = (
  page: Page
) =>
  pipe(
    page,
    browser,
    WebTeer.chainTaskK((b) => () => b.pages()),
    WebTeer.chain((pages) => {
      const pageIndex = pages.findIndex((page_) => page === page_);
      if (pageIndex < 0) {
        return WebTeer.left(
          new Error(
            `Impossible case. No main page in pages found. pageIndex =${pageIndex}`
          )
        );
      } else {
        const lastIndex = pages.length - 1;
        if (lastIndex > pageIndex) {
          return pipe(
            pages[lastIndex],
            close,
            WebTeer.chain(() => closeOtherPages(page))
          );
        } else {
          return WebTeer.right(page);
        }
      }
    })
  );
export const bringToFront = (page: Page): WebTeer.WebProgram<void> =>
  WebTeer.fromTaskK(() => () => page.bringToFront())();
