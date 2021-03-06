/**
 * @since 1.0.0
 */
import * as C from 'fp-ts/Console';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import { IO } from 'fp-ts/lib/IO';
import { Option } from 'fp-ts/lib/Option';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { Page } from 'puppeteer';

import { toString } from './ErrorUtils';
import * as J from './Json';
import { WebDeps } from './WebDeps';
import * as WP from './WebProgram';

/**
 * @since 1.0.0
 */
export const startFrom = <A>(wpa: WP.WebProgram<A>) => (
  tep: TE.TaskEither<Error, Page>
): TE.TaskEither<Error, A> =>
  pipe(
    tep,
    TE.map<Page, WebDeps>((page) => ({ page })),
    TE.chain((deps) => wpa(deps))
  );
/**
 * @since 1.0.0
 */
export const startFromPage = <A>(wpa: WP.WebProgram<A>) => (
  page: Page
): TE.TaskEither<Error, A> => pipe(TE.of(page), startFrom(wpa));
/**
 * @since 1.0.0
 */
export const startFromTaskPage = <A>(wpa: WP.WebProgram<A>) => (
  tp: T.Task<Page>
): TE.TaskEither<Error, A> =>
  pipe(TE.fromTask<Error, Page>(tp), startFrom(wpa));
/**
 * @since 1.0.0
 */
export const startFromEitherPage = <A>(wpa: WP.WebProgram<A>) => (
  ep: E.Either<Error, Page>
): TE.TaskEither<Error, A> =>
  pipe(TE.fromEither<Error, Page>(ep), startFrom(wpa));
/**
 * @since 1.0.0
 */
export const startFromIOPage = <A>(wpa: WP.WebProgram<A>) => (
  iop: IO<Page>
): TE.TaskEither<Error, A> => pipe(TE.fromIO<Error, Page>(iop), startFrom(wpa));
/**
 * @since 1.0.0
 */
export const startFromIOEitherPage = <A>(wpa: WP.WebProgram<A>) => (
  ioep: IO<E.Either<Error, Page>>
): TE.TaskEither<Error, A> =>
  pipe(TE.fromIOEither<Error, Page>(ioep), startFrom(wpa));
/**
 * @since 1.0.0
 */
export const startFromOptionPage = <A>(wpa: WP.WebProgram<A>) => (
  ioep: Option<Page>
): TE.TaskEither<Error, A> =>
  pipe(
    TE.fromOption<Error>(
      () => new Error(`No page while starting process.`)
    )<Page>(ioep),
    startFrom(wpa)
  );
/**
 * @since 1.0.0
 */
export const log = <A>(tea: TE.TaskEither<Error, A>) =>
  pipe(
    tea,
    TE.match(
      (e) =>
        C.error(
          `--------- --------- --------- --------- --------- ---------\n` +
            `-Error occurred.\n` +
            `-Message:\n` +
            `-${toString(e)}\n` +
            `--------- --------- --------- --------- --------- ---------`
        )(),
      (a) =>
        pipe(
          a === undefined || a === null
            ? E.right<Error, string>(`${a}`)
            : J.stringify(a),
          E.orElse((e) =>
            pipe(
              C.warn(
                `Returned object is not stringifiable, undefined or null.\n` + e
              )(),
              () => E.right<Error, string>(`${a}`)
            )
          ),
          E.map((toLog) =>
            C.log(
              `--------- --------- --------- --------- --------- ---------\n` +
                `Program ended with no left (handled error situation).\n` +
                `--------- Returned object: ${toLog}\n` +
                `--------- --------- --------- --------- --------- ---------`
            )()
          )
        )
    )
  );
