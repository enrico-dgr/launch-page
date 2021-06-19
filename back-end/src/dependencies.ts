/**
 * @since 1.0.0
 */
import { pipe } from 'fp-ts/lib/function';
import { Browser, ElementHandle, Page } from 'puppeteer';

import * as WT from './';
import * as PageUtils from './page';

/**
 * @since 1.0.0
 */
export const onReaderPage = <A>(wp: (page: Page) => WT.WebProgram<A>) =>
  pipe(
    WT.ask(),
    WT.chain((r) => wp(r.page))
  );

/**
 * @param xPath
 * @returns Array or empty array.
 * @description Runs `page.waitForXPath` and then `page.$x`
 * @since 1.0.0
 */
export const waitFor$x = (
  xPath: string
): WT.WebProgram<ElementHandle<Element>[]> =>
  onReaderPage(PageUtils.waitFor$x(xPath));
/**
 * @since 1.0.0
 */
export const $x = (xPath: string): WT.WebProgram<ElementHandle<Element>[]> =>
  onReaderPage(PageUtils.$x(xPath));
/**
 * @param selector
 * @returns Array or empty array.
 * @description Runs `page.waitForSelector` and then `page.$$`
 * @since 1.0.0
 */
export const waitFor$$: (
  selector: string
) => WT.WebProgram<ElementHandle<Element>[]> = (selector) =>
  onReaderPage(PageUtils.waitFor$$(selector));
/**
 * @since 1.0.0
 */
export const $$: (
  selector: string
) => WT.WebProgram<ElementHandle<Element>[]> = (selector) =>
  onReaderPage(PageUtils.$$(selector));
/**
 * @since 1.0.0
 */
export const goto = (url: string): WT.WebProgram<void> =>
  onReaderPage(PageUtils.goto(url));
/**
 * @since 1.0.0
 */
export const browser: WT.WebProgram<Browser> = onReaderPage(PageUtils.browser);
/**
 * @returns the new page
 * @since 1.0.0
 */
export const openNewPage: WT.WebProgram<Page> = onReaderPage(
  PageUtils.openNewPage
);
/**
 * @since 1.0.0
 */
export const openNewPageToUrl: (url: string) => WT.WebProgram<Page> = (url) =>
  onReaderPage(PageUtils.openNewPageToUrl(url));
/**
 * @since 1.0.0
 */
export const closeOtherPages = onReaderPage(PageUtils.closeOtherPages);
/**
 * @since 1.0.0
 */
export const bringToFront: WT.WebProgram<void> = onReaderPage(
  PageUtils.bringToFront
);
/**
 * @since 1.0.0
 */
export const otherPages: WT.WebProgram<Page[]> = onReaderPage(
  PageUtils.otherPages
);
