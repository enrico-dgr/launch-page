/**
 * @since 1.0.0
 */
import { flow, pipe } from 'fp-ts/lib/function';
import { Browser, ElementHandle, HTTPResponse, Page, WaitForOptions } from 'puppeteer';

import * as PageUtils from './page';
import * as WT from './WebProgram';

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
/**
 * @param options Look at puppeteer docs.
 *
 * @example
 * // You can simply emulate a device as
 * // it happens for puppeteer.
 * import { emulate } from 'WebTeer/dependencies.ts';
 * import * as WT from 'WebTeer/index.ts';
 * import { devices } from "puppeteer";
 *
 * const iPhone = devices["iPhone 6"];
 *
 * (async ()=>{
 *  // ... launching puppeteer and deps
 *  pipe(
 *    emulate(iPhone)(r.page)
 *    // then change page or reload to see the effects
 *  )(deps: WT.WebDeps)
 * })()
 * @since 1.0.0
 */
export const emulate = flow(PageUtils.emulate, onReaderPage);

/**
 * @since 1.0.0
 */
export const setUserAgent = flow(PageUtils.setUserAgent, onReaderPage);
/**
 * @since 1.0.0
 */
export const reload = flow(PageUtils.reload, onReaderPage);
/**
 * @since 1.0.0
 */
export const screen = flow(PageUtils.screen, onReaderPage);
/**
 * @since 1.0.0
 */
// -----------------------
// page.keyboard
// -----------------------
export const keyboard = {
  type: flow(PageUtils.keyboard.type, onReaderPage),
  press: flow(PageUtils.keyboard.press, onReaderPage),
};
/**
 *
 */
export const runOnAnyDifferentPage = <A>(
  wpa: WT.WebProgram<A>
): WT.WebProgram<A> =>
  pipe(
    otherPages,
    WT.chain((pages) => (pages.length > 0 ? WT.of(pages[0]) : openNewPage)),
    WT.chain<Page, A>((page) =>
      pipe(
        WT.ask(),
        WT.chainTaskEitherK((r) =>
          pipe(
            bringToFront,
            WT.chain(() => wpa)
          )({ ...r, page })
        )
      )
    )
  );
