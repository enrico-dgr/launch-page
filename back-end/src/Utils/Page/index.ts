import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import { Browser, ElementHandle, Page } from 'puppeteer';

import * as WT from '../..';

/**
 * @param xPath
 * @returns Array or empty array.
 * @description Runs `page.waitForXPath` and then `page.$x`
 */
export const waitFor$x = (xPath: string) => (
  page: Page
): WT.WebProgram<ElementHandle<Element>[]> =>
  pipe(
    WT.of(undefined),
    WT.fromTaskK(() => () =>
      page
        .waitForXPath(xPath)
        .then(() => undefined)
        .catch(() => undefined)
    ),
    WT.chain(() => $x(xPath)(page))
  );
export const $x = (XPath: string) => (
  page: Page
): WT.WebProgram<ElementHandle<Element>[]> =>
  WT.fromTaskEither(() =>
    page
      .$x(XPath)
      .then((els) =>
        els !== undefined
          ? E.right(els)
          : // : E.left(new Error(`No element found at XPath ${XPath}`))
            E.right([])
      )
      .catch((err) => E.left(WT.anyToError(err)))
  );
/**
 * @param selector
 * @returns Array or empty array.
 * @description Runs `page.waitForSelector` and then `page.$$`
 */
export const waitFor$$ = (selector: string) => (
  page: Page
): WT.WebProgram<ElementHandle<Element>[]> =>
  pipe(
    WT.of(undefined),
    WT.fromTaskK(() => () =>
      page
        .waitForSelector(selector)
        .then(() => undefined)
        .catch(() => undefined)
    ),
    WT.chain(() => $$(selector)(page))
  );
export const $$ = (selector: string) => (
  page: Page
): WT.WebProgram<ElementHandle<Element>[]> =>
  WT.fromTaskEither(() =>
    page
      .$$(selector)
      .then((els) => E.right(els))
      .catch((err) => E.left(WT.anyToError(err)))
  );
/**
 *
 */
export const goto = (url: string) => (page: Page): WT.WebProgram<void> =>
  WT.fromTaskEither(() =>
    page
      .goto(url)
      .then(() => E.right(undefined))
      .catch((err) => E.left(WT.anyToError(err)))
  );
/**
 *
 */
export const browser = (page: Page): WT.WebProgram<Browser> =>
  WT.of(page.browser());
/**
 * @returns the new page
 */
export const openNewPage: (page: Page) => WT.WebProgram<Page> = flow(
  browser,
  WT.chainTaskK((b) => () => b.newPage())
);
/**
 *
 * @param url
 * @returns the new Page
 */
export const openNewPageToUrl: (
  url: string
) => (page: Page) => WT.WebProgram<Page> = (url) =>
  flow(
    openNewPage,
    WT.chain((page_) =>
      pipe(
        page_,
        goto(url),
        WT.chain(() => WT.of(page_))
      )
    )
  );
export const close: (page: Page) => WT.WebProgram<void> = (page) =>
  WT.fromTaskK(() => () => page.close())();
export const otherPages: (page: Page) => WT.WebProgram<Page[]> = (page: Page) =>
  pipe(
    page,
    browser,
    WT.chainTaskK((b) => () => b.pages()),
    WT.chain((pages) => {
      const pageIndex = pages.findIndex((page_) => page === page_);
      if (pageIndex < 0) {
        return WT.left(
          new Error(
            `Impossible case. No main page in pages found. pageIndex =${pageIndex}`
          )
        );
      } else {
        const lastIndex = pages.length - 1;
        if (lastIndex > pageIndex) {
          return WT.of(pages.slice(pageIndex + 1));
        } else {
          return WT.right([]);
        }
      }
    })
  );
/**
 * @todo refactoring using *otherPages* abstraction
 */
export const closeOtherPages: (page: Page) => WT.WebProgram<Page> = (
  page: Page
) =>
  pipe(
    page,
    browser,
    WT.chainTaskK((b) => () => b.pages()),
    WT.chain((pages) => {
      const pageIndex = pages.findIndex((page_) => page === page_);
      if (pageIndex < 0) {
        return WT.left(
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
            WT.chain(() => closeOtherPages(page))
          );
        } else {
          return WT.right(page);
        }
      }
    })
  );
export const bringToFront = (page: Page): WT.WebProgram<void> =>
  WT.fromTaskK(() => () => page.bringToFront())();
