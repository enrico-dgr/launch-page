import { ElementHandle } from "puppeteer";
import * as WebTeer from "../..";
import * as E from "fp-ts/Either";
import * as RTE from "fp-ts/ReaderTaskEither";
import { pipe } from "fp-ts/lib/function";
/**
 * @param xPath
 * @returns Array or empty array.
 * @description Runs `page.waitForXPath` and then `page.$x`
 */
export const waitFor$x = (
  xPath: string
): WebTeer.WebProgram<ElementHandle<Element>[]> =>
  pipe(
    RTE.ask<WebTeer.WebDeps, Error>(),
    RTE.chainTaskK((r) => () =>
      r.page
        .waitForXPath(xPath)
        .then(() => r)
        .catch(() => r)
    ),
    RTE.chain(() => $x(xPath))
  );
export const $x = (
  xPath: string
): WebTeer.WebProgram<ElementHandle<Element>[]> =>
  pipe(
    RTE.ask<WebTeer.WebDeps, Error>(),
    RTE.chainTaskEitherK((r) => () =>
      r.page
        .$x(xPath)
        .then((els) => E.right(els))
        .catch((err) => E.left(WebTeer.anyToError(err)))
    )
  );
/**
 * @param selector
 * @returns Array or empty array.
 * @description Runs `page.waitForSelector` and then `page.$$`
 */
export const waitFor$$ = (
  selector: string
): WebTeer.WebProgram<ElementHandle<Element>[]> =>
  pipe(
    RTE.ask<WebTeer.WebDeps, Error>(),
    RTE.chainTaskK((r) => () =>
      r.page
        .waitForSelector(selector)
        .then(() => r)
        .catch(() => r)
    ),
    RTE.chainTaskEitherK((r) => () =>
      r.page
        .$$(selector)
        .then((els) => E.right(els))
        .catch((err) => E.left(WebTeer.anyToError(err)))
    )
  );
/**
 *
 */
export const goto = (url: string): WebTeer.WebProgram<void> =>
  pipe(
    WebTeer.ask(),
    WebTeer.chainTaskEitherK((r) => () =>
      r.page
        .goto(url)
        .then(() => E.right(undefined))
        .catch((err) => E.left(WebTeer.anyToError(err)))
    )
  );
