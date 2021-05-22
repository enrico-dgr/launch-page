import { ElementHandle, Page } from "puppeteer";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as RTE from "fp-ts/ReaderTaskEither";
import {} from "fp-ts";
import { pipe } from "fp-ts/lib/function";

export interface WebDeps {
  page: Page;
}

/**
 * @param xPath
 * @returns Array or empty array.
 * @description Runs `page.waitForXPath` and then `page.$x`
 */
export const waitFor$x = (
  xPath: string
): RTE.ReaderTaskEither<WebDeps, Error, ElementHandle<Element>[]> =>
  pipe(
    RTE.ask<WebDeps, Error>(),
    RTE.chainTaskK((r) => () =>
      r.page
        .waitForXPath(xPath)
        .then(() => r)
        .catch(() => r)
    ),
    RTE.chainTaskEitherK((r) => () =>
      r.page
        .$x(xPath)
        .then((els) => E.right(els))
        .catch((err) =>
          err instanceof Error
            ? E.left(err)
            : E.left(new Error(JSON.stringify(err)))
        )
    )
  );
/**
 * @param selector
 * @returns Array or empty array.
 * @description Runs `page.waitForSelector` and then `page.$$`
 */
export const waitFor$$ = (
  selector: string
): RTE.ReaderTaskEither<WebDeps, Error, ElementHandle<Element>[]> =>
  pipe(
    RTE.ask<WebDeps, Error>(),
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
        .catch((err) =>
          err instanceof Error
            ? E.left(err)
            : E.left(new Error(JSON.stringify(err)))
        )
    )
  );
