import { log } from 'fp-ts/Console';
import { pipe } from 'fp-ts/function';
import { format } from 'prettier';

import * as WP from '../WebProgram';

/**
 * @since 1.0.0
 */
export const errorInfosToString = (e: Error) =>
  format(e.message, { parser: "json" }) + "\n Source path:" + e.stack ?? "";

const runAndLog = <A>(wp: WP.WebProgram<A>) =>
  pipe(
    wp,
    WP.match(
      (e) =>
        log(
          `--------- --------- --------- ---------\n` +
            `Program run with error.\n` +
            `--------- Message: 
            ${errorInfosToString(e)}\n` +
            `--------- --------- --------- ---------`
        )(),
      (a) =>
        log(
          `--------- --------- --------- ---------\n` +
            `Program run to the end.\n` +
            `--------- Returned object: ${JSON.stringify(a)}\n` +
            `--------- --------- --------- ---------`
        )()
    )
  );
export { runAndLog };
