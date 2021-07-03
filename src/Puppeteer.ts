/**
 * @since 1.0.0
 */
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import P from 'puppeteer';

import * as EU from './ErrorUtils';

/**
 * @ignore
 */
export type LaunchOptions = P.LaunchOptions &
  P.ChromeArgOptions &
  P.BrowserOptions & {
    product?: P.Product;
    extraPrefsFirefox?: Record<string, unknown>;
  };
/**
 * @returns A page for `WebDeps`
 *
 * (`type WebProgram<A> = ReaderTaskEither<WebDeps,Error,A>`)
 * @since 1.0.0
 */
export const launchPage = (
  options?: LaunchOptions
): TE.TaskEither<Error, P.Page> =>
  pipe(
    () =>
      P.launch(options)
        .then(E.right)
        .catch((err) => EU.anyToError<Error, P.Browser>(err)),
    TE.chain<Error, P.Browser, P.Page>((browser) => () =>
      browser
        .newPage()
        .then((page) => E.right<Error, P.Page>(page))
        .catch((err) => EU.anyToError<Error, P.Page>(err))
    ),
    TE.orElse<Error, P.Page, Error>((e) =>
      TE.left(
        EU.appendMessage("Unknown error on launching puppeteer browser.")(e)
      )
    )
  );

/**
 *
 */
