/**
 * @since 1.0.0
 */
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import { Browser, ElementHandle, HTTPResponse, KeyInput, Page, WaitForOptions } from 'puppeteer';

import * as EU from './ErrorUtils';
import * as WP from './WebProgram';

/**
 * @param xPath
 * @returns Array or empty array.
 * @description Runs `page.waitForXPath` and then `page.$x`
 * @since 1.0.0
 */
export const waitFor$x = (xPath: string) => (
  page: Page
): WP.WebProgram<ElementHandle<Element>[]> =>
  pipe(
    WP.of(undefined),
    WP.fromTaskK(() => () =>
      page
        .waitForXPath(xPath)
        .then(() => undefined)
        .catch(() => undefined)
    ),
    WP.chain(() => $x(xPath)(page))
  );
/**
 * @since 1.0.0
 */
export const $x = (XPath: string) => (
  page: Page
): WP.WebProgram<ElementHandle<Element>[]> =>
  WP.fromTaskEither(() =>
    page
      .$x(XPath)
      .then((els) => (els !== undefined ? E.right(els) : E.right([])))
      .catch((err) => EU.anyToError(err))
  );
/**
 * @param selector
 * @returns Array or empty array.
 * @description Runs `page.waitForSelector` and then `page.$$`
 * @since 1.0.0
 */
export const waitFor$$ = (selector: string) => (
  page: Page
): WP.WebProgram<ElementHandle<Element>[]> =>
  pipe(
    WP.of(undefined),
    WP.fromTaskK(() => () =>
      page
        .waitForSelector(selector)
        .then(() => undefined)
        .catch(() => undefined)
    ),
    WP.chain(() => $$(selector)(page))
  );
/**
 * @since 1.0.0
 */
export const $$ = (selector: string) => (
  page: Page
): WP.WebProgram<ElementHandle<Element>[]> =>
  WP.fromTaskEither(() =>
    page
      .$$(selector)
      .then((els) => E.right(els))
      .catch((err) => EU.anyToError(err))
  );
/**
 * @since 1.0.0
 */
export const goto = (url: string) => (page: Page): WP.WebProgram<void> =>
  WP.fromTaskEither(() =>
    page
      .goto(url)
      .then(() => E.right(undefined))
      .catch((err) => EU.anyToError(err))
  );
/**
 * @since 1.0.0
 */
export const browser = (page: Page): WP.WebProgram<Browser> =>
  WP.of(page.browser());
/**
 * @returns the new page
 * @since 1.0.0
 */
export const openNewPage: (page: Page) => WP.WebProgram<Page> = flow(
  browser,
  WP.chainTaskK((b) => () => b.newPage())
);
/**
 *
 * @param url
 * @returns the new Page
 * @since 1.0.0
 */
export const openNewPageToUrl: (
  url: string
) => (page: Page) => WP.WebProgram<Page> = (url) =>
  flow(
    openNewPage,
    WP.chain((page_) =>
      pipe(
        page_,
        goto(url),
        WP.chain(() => WP.of(page_))
      )
    )
  );
/**
 * @since 1.0.0
 */
export const close: (page: Page) => WP.WebProgram<void> = (page) =>
  WP.fromTaskK(() => () => page.close())();
/**
 * @since 1.0.0
 */
export const otherPages: (page: Page) => WP.WebProgram<Page[]> = (page: Page) =>
  pipe(
    page,
    browser,
    WP.chainTaskK((b) => () => b.pages()),
    WP.chain((pages) => {
      const pageIndex = pages.findIndex((page_) => page === page_);
      if (pageIndex < 0) {
        return WP.left(
          new Error(
            `Impossible case. No main page in pages found. pageIndex =${pageIndex}`
          )
        );
      } else {
        const lastIndex = pages.length - 1;
        if (lastIndex > pageIndex) {
          return WP.of(pages.slice(pageIndex + 1));
        } else {
          return WP.right([]);
        }
      }
    })
  );
/**
 * @todo refactoring using *otherPages* abstraction
 * @since 1.0.0
 */
export const closeOtherPages: (page: Page) => WP.WebProgram<Page> = (
  page: Page
) =>
  pipe(
    page,
    browser,
    WP.chainTaskK((b) => () => b.pages()),
    WP.chain((pages) => {
      const pageIndex = pages.findIndex((page_) => page === page_);
      if (pageIndex < 0) {
        return WP.left(
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
            WP.chain(() => closeOtherPages(page))
          );
        } else {
          return WP.right(page);
        }
      }
    })
  );
/**
 * @since 1.0.0
 */
export const bringToFront = (page: Page): WP.WebProgram<void> =>
  WP.fromTaskK(() => () => page.bringToFront())();
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
 *    WP.ask(),
 *    WP.chain(r =>
 *      emulate(iPhone)(r.page)
 *    )
 *    // then change page or reload to see the effects
 *  )({ page } as WD.WebDeps)()
 * })()
 * @since 1.0.0
 */
export const emulate = (options: {
  /**
   * This is of type `Viewport`.
   * For info go to puppeteer docs.
   */
  viewport: {};
  userAgent: string;
}) => (page: Page): WP.WebProgram<void> =>
  WP.fromTaskK(() => () => page.emulate(options as any))();
/**
 * @since 1.0.0
 */
export const setUserAgent = (userAgent: string) => (
  page: Page
): WP.WebProgram<void> =>
  WP.fromTaskK(() => () => page.setUserAgent(userAgent))();

/**
 * @since 1.0.0
 */
export const reload = (options?: WaitForOptions) => (
  page: Page
): WP.WebProgram<HTTPResponse> =>
  pipe(
    WP.fromTaskK(() => () => page.reload(options))(),
    WP.chain((res) =>
      res === null
        ? WP.left(new Error(`Page reloading returned 'null' value.`))
        : WP.right(res)
    )
  );
/**
 * @since 1.0.0
 */
export const screen = (path: string) => (page: Page) =>
  WP.fromTaskEither(() =>
    page
      .screenshot({
        path,
      })
      .then(E.right)
      .catch((err) => EU.anyToError(err))
  );

// -----------------------
// page.keyboard
// -----------------------
/**
 * @since 1.0.0
 */
export const keyboard = {
  type: (
    text: string,
    options?: {
      delay?: number | undefined;
    }
  ) => (page: Page): WP.WebProgram<void> =>
    pipe(
      WP.fromTaskEither(() =>
        page.keyboard
          .type(text, options)
          .then(E.right)
          .catch((err) => EU.anyToError<any, void>(err))
      ),
      WP.orElseAppendMessage(`Page's keyboard failed to type.`)
    ),
  press: (
    text: KeyInput,
    options?: {
      delay?: number | undefined;
      text?: string | undefined;
    }
  ) => (page: Page): WP.WebProgram<void> =>
    pipe(
      WP.fromTaskEither(() =>
        page.keyboard
          .press(text, options)
          .then(E.right)
          .catch((err) => EU.anyToError<any, void>(err))
      ),
      WP.orElseAppendMessage(`Page's keyboard failed to press.`)
    ),
};
