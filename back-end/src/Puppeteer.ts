/**
 * @since 1.0.0
 */
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import path from 'path';
import P from 'puppeteer';

import { anyToError, stackErrorInfos } from './ErrorInfos';

const PATH = path.resolve(__filename);
/**
 * @returns A page for `WebDeps`
 *
 * (`type WebProgram<A> = ReaderTaskEither<WebDeps,Error,A>`)
 * @since 1.0.0
 */
export type LaunchOptions = P.LaunchOptions &
  P.ChromeArgOptions &
  P.BrowserOptions & {
    product?: P.Product;
    extraPrefsFirefox?: Record<string, unknown>;
  };
export const launchPage = (
  options?: LaunchOptions
): TE.TaskEither<Error, P.Page> =>
  pipe(
    () =>
      P.launch(options)
        .then(E.right)
        .catch((err) => anyToError<Error, P.Browser>(err)),
    TE.chain<Error, P.Browser, P.Page>((browser) => () =>
      browser
        .newPage()
        .then((page) => E.right<Error, P.Page>(page))
        .catch((err) => anyToError<Error, P.Page>(err))
    ),
    TE.orElse<Error, P.Page, Error>(
      flow(
        stackErrorInfos({
          message: "Unknown error on launching puppeteer browser.",
          nameOfFunction: "launch",
          filePath: PATH,
        }),
        TE.left
      )
    )
  );

/**
 *
 */
