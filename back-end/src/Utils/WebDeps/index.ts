import { pipe } from 'fp-ts/lib/function';
import { Browser, ElementHandle, Page } from 'puppeteer';

import * as WebTeer from '../..';
import * as PageUtils from '../Page';

/**
 *
 */
export const onReaderPage = <A>(wp: (page: Page) => WebTeer.WebProgram<A>) =>
  pipe(
    WebTeer.ask(),
    WebTeer.chain((r) => wp(r.page))
  );

/**
 * @param xPath
 * @returns Array or empty array.
 * @description Runs `page.waitForXPath` and then `page.$x`
 */
export const waitFor$x = (
  xPath: string
): WebTeer.WebProgram<ElementHandle<Element>[]> =>
  onReaderPage(PageUtils.waitFor$x(xPath));
export const $x = (
  xPath: string
): WebTeer.WebProgram<ElementHandle<Element>[]> =>
  onReaderPage(PageUtils.$x(xPath));
/**
 * @param selector
 * @returns Array or empty array.
 * @description Runs `page.waitForSelector` and then `page.$$`
 */
export const waitFor$$: (
  selector: string
) => WebTeer.WebProgram<ElementHandle<Element>[]> = (selector) =>
  onReaderPage(PageUtils.waitFor$$(selector));
/**
 *
 * @param selector
 * @returns
 */
export const $$: (
  selector: string
) => WebTeer.WebProgram<ElementHandle<Element>[]> = (selector) =>
  onReaderPage(PageUtils.$$(selector));
/**
 *
 */
export const goto = (url: string): WebTeer.WebProgram<void> =>
  onReaderPage(PageUtils.goto(url));
/**
 *
 */
export const browser: WebTeer.WebProgram<Browser> = onReaderPage(
  PageUtils.browser
);
/**
 * @returns the new page
 */
export const openNewPage: WebTeer.WebProgram<Page> = onReaderPage(
  PageUtils.openNewPage
);
/**
 *
 * @param url
 * @returns
 */
export const openNewPageToUrl: (url: string) => WebTeer.WebProgram<Page> = (
  url
) => onReaderPage(PageUtils.openNewPageToUrl(url));
export const closeOtherPages = onReaderPage(PageUtils.closeOtherPages);
/**
 *
 */
export const bringToFront: WebTeer.WebProgram<void> = onReaderPage(
  PageUtils.bringToFront
);
/**
 *
 */
export const otherPages: WebTeer.WebProgram<Page[]> = onReaderPage(
  PageUtils.otherPages
);
