/**
 * @since 1.0.0
 */
import { flow, pipe } from 'fp-ts/lib/function';
import { Browser, ElementHandle, Page } from 'puppeteer';

import * as PageUtils from './Page';
import * as WP from './WebProgram';

/**
 * @since 1.0.0
 */

export interface WebDeps {
  page: Page;
}
// ------------------------------------------
// Page
// ------------------------------------------
/**
 * @description
 * Basically every function in this file is a composition of this function
 * and a function of Page.ts
 * @since 1.0.0
 */
export const onReaderPage = <A>(wp: (page: Page) => WP.WebProgram<A>) =>
  pipe(
    WP.ask(),
    WP.chain((r) => wp(r.page))
  );

/**
 * @param xPath
 * @returns Array or empty array.
 * @description Runs `page.waitForXPath` and then `page.$x`
 * @since 1.0.0
 */
export const waitFor$x = (
  xPath: string
): WP.WebProgram<ElementHandle<Element>[]> =>
  onReaderPage(PageUtils.waitFor$x(xPath));
/**
 * @since 1.0.0
 */
export const $x = (xPath: string): WP.WebProgram<ElementHandle<Element>[]> =>
  onReaderPage(PageUtils.$x(xPath));
/**
 * @param selector
 * @returns Array or empty array.
 * @description Runs `page.waitForSelector` and then `page.$$`
 * @since 1.0.0
 */
export const waitFor$$: (
  selector: string
) => WP.WebProgram<ElementHandle<Element>[]> = (selector) =>
  onReaderPage(PageUtils.waitFor$$(selector));
/**
 * @since 1.0.0
 */
export const $$: (
  selector: string
) => WP.WebProgram<ElementHandle<Element>[]> = (selector) =>
  onReaderPage(PageUtils.$$(selector));
/**
 * @since 1.0.0
 */
export const goto = (url: string): WP.WebProgram<void> =>
  onReaderPage(PageUtils.goto(url));
/**
 * @since 1.0.0
 */
export const browser: WP.WebProgram<Browser> = onReaderPage(PageUtils.browser);
/**
 * @returns the new page
 * @since 1.0.0
 */
export const openNewPage: WP.WebProgram<Page> = onReaderPage(
  PageUtils.openNewPage
);
/**
 * @since 1.0.0
 */
export const openNewPageToUrl: (url: string) => WP.WebProgram<Page> = (url) =>
  onReaderPage(PageUtils.openNewPageToUrl(url));
/**
 * @since 1.0.0
 */
export const closeOtherPages = onReaderPage(PageUtils.closeOtherPages);
/**
 * @since 1.0.0
 */
export const bringToFront: WP.WebProgram<void> = onReaderPage(
  PageUtils.bringToFront
);
/**
 * @since 1.0.0
 */
export const otherPages: WP.WebProgram<Page[]> = onReaderPage(
  PageUtils.otherPages
);
/**
 * @param options Look at puppeteer docs.
 *
 * @example
 * // You can simply emulate a device as
 * // it happens for puppeteer.
 * import { pipe } from 'fp-ts/lib/function';
 * import { emulate } from '../../src/Page';
 * import * as WP from '../../src/WebProgram';
 * import * as WD from '../../src/WebDeps';
 * import { devices, launch } from "puppeteer";
 *
 * const iPhone = devices["iPhone 6"];
 *
 * (async ()=>{
 *  // ... launching puppeteer and deps
 *  const browser = await launch();
 *  const page = await browser.newPage();
 *  //
 *  await pipe(
 *    WD.emulate(iPhone)
 *    // then change page or reload to see the effects
 *  )(({ page }) as WD.WebDeps)()
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
 * @since 1.0.0
 */
export const runOnAnyDifferentPage = <A>(
  wpa: WP.WebProgram<A>
): WP.WebProgram<A> =>
  pipe(
    otherPages,
    WP.chain((pages) => (pages.length > 0 ? WP.of(pages[0]) : openNewPage)),
    WP.chain<Page, A>((page) =>
      pipe(
        WP.ask(),
        WP.chainTaskEitherK((r) =>
          pipe(
            bringToFront,
            WP.chain(() => wpa)
          )({ ...r, page })
        )
      )
    )
  );
