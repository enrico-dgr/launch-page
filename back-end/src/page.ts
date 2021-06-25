/**
 * @since 1.0.0
 */
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import path from 'path';
import {
    Browser, ElementHandle, HTTPResponse, Keyboard, KeyInput, Page, WaitForOptions
} from 'puppeteer';

import { anyToError } from './ErrorInfos';
import * as WT from './WebProgram';

const ABSOLUTE_PATH = path.resolve(__filename);
/**
 * @param xPath
 * @returns Array or empty array.
 * @description Runs `page.waitForXPath` and then `page.$x`
 * @since 1.0.0
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
/**
 * @since 1.0.0
 */
export const $x = (XPath: string) => (
  page: Page
): WT.WebProgram<ElementHandle<Element>[]> =>
  WT.fromTaskEither(() =>
    page
      .$x(XPath)
      .then((els) => (els !== undefined ? E.right(els) : E.right([])))
      .catch((err) => anyToError(err))
  );
/**
 * @param selector
 * @returns Array or empty array.
 * @description Runs `page.waitForSelector` and then `page.$$`
 * @since 1.0.0
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
/**
 * @since 1.0.0
 */
export const $$ = (selector: string) => (
  page: Page
): WT.WebProgram<ElementHandle<Element>[]> =>
  WT.fromTaskEither(() =>
    page
      .$$(selector)
      .then((els) => E.right(els))
      .catch((err) => anyToError(err))
  );
/**
 * @since 1.0.0
 */
export const goto = (url: string) => (page: Page): WT.WebProgram<void> =>
  WT.fromTaskEither(() =>
    page
      .goto(url)
      .then(() => E.right(undefined))
      .catch((err) => anyToError(err))
  );
/**
 * @since 1.0.0
 */
export const browser = (page: Page): WT.WebProgram<Browser> =>
  WT.of(page.browser());
/**
 * @returns the new page
 * @since 1.0.0
 */
export const openNewPage: (page: Page) => WT.WebProgram<Page> = flow(
  browser,
  WT.chainTaskK((b) => () => b.newPage())
);
/**
 *
 * @param url
 * @returns the new Page
 * @since 1.0.0
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
/**
 * @since 1.0.0
 */
export const close: (page: Page) => WT.WebProgram<void> = (page) =>
  WT.fromTaskK(() => () => page.close())();
/**
 * @since 1.0.0
 */
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
 * @since 1.0.0
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
/**
 * @since 1.0.0
 */
export const bringToFront = (page: Page): WT.WebProgram<void> =>
  WT.fromTaskK(() => () => page.bringToFront())();
/**
 * @param options Look at puppeteer docs.
 *
 * @example
 * // You can simply emulate a device as
 * // it happens for puppeteer.
 * import { emulate } from 'WebTeer/page.ts';
 * import * as WT from 'WebTeer/index.ts';
 * import { devices } from "puppeteer";
 *
 * const iPhone = devices["iPhone 6"];
 *
 * (async ()=>{
 *  // ... launching puppeteer and deps
 *  pipe(
 *    WT.ask(),
 *    WT.chain(r =>
 *      emulate(iPhone)(r.page)
 *    )
 *    // then change page or reload to see the effects
 *  )(deps: WT.WebDeps)
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
}) => (page: Page): WT.WebProgram<void> =>
  WT.fromTaskK(() => () => page.emulate(options as any))();
/**
 * @since 1.0.0
 */
export const setUserAgent = (userAgent: string) => (
  page: Page
): WT.WebProgram<void> =>
  WT.fromTaskK(() => () => page.setUserAgent(userAgent))();

/**
 * @since 1.0.0
 */
export const reload = (options?: WaitForOptions) => (
  page: Page
): WT.WebProgram<HTTPResponse> =>
  pipe(
    WT.fromTaskK(() => () => page.reload(options))(),
    WT.chain((res) =>
      res === null
        ? WT.leftFromErrorInfos({
            message: `Page reloading returned 'null' value.`,
            nameOfFunction: "reload",
            filePath: ABSOLUTE_PATH,
          })
        : WT.right(res)
    )
  );
/**
 * @since 1.0.0
 */
export const screen = (path: string) => (page: Page) =>
  WT.fromTaskEither(() =>
    page
      .screenshot({
        path,
      })
      .then(E.right)
      .catch((err) => anyToError(err))
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
  ) => (page: Page): WT.WebProgram<void> =>
    pipe(
      WT.fromTaskEither(() =>
        page.keyboard
          .type(text, options)
          .then(E.right)
          .catch((err) => anyToError<any, void>(err))
      ),
      WT.orElseStackErrorInfos({
        message: `Page's keyboard failed to type.`,
        nameOfFunction: "keyboard.type",
        filePath: ABSOLUTE_PATH,
      })
    ),
  press: (
    text: KeyInput,
    options?: {
      delay?: number | undefined;
      text?: string | undefined;
    }
  ) => (page: Page): WT.WebProgram<void> =>
    pipe(
      WT.fromTaskEither(() =>
        page.keyboard
          .press(text, options)
          .then(E.right)
          .catch((err) => anyToError<any, void>(err))
      ),
      WT.orElseStackErrorInfos({
        message: `Page's keyboard failed to press.`,
        nameOfFunction: "keyboard.press",
        filePath: ABSOLUTE_PATH,
      })
    ),
};
