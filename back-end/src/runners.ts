/**
 * @since 1.0.0
 */
import * as C from 'fp-ts/Console';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { Page } from 'puppeteer';
import { toString } from 'src/ErrorInfos';
import * as J from 'src/Json';
import * as WT from 'src/WebProgram';

import { WebDeps } from './WebDeps';

/**
 * @since 1.0.0
 */
export const start = <A>(wpa: WT.WebProgram<A>) => (
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
export const log = <A>(tea: TE.TaskEither<Error, A>) =>
  pipe(
    tea,
    TE.match(
      (e) =>
        C.error(
          `--------- --------- --------- --------- --------- ---------\n` +
            `Program stopped because of left (handled error situation).\n` +
            `--------- Message: ${toString(e)}\n` +
            `--------- --------- --------- --------- --------- ---------`
        )(),
      (a) =>
        pipe(
          J.stringify(a),
          E.orElse((e) =>
            pipe(C.warn(e)(), () => E.right<Error, string>(`${a}`))
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
J.stringify;
