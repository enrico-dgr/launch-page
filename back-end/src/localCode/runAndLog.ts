import { log } from 'fp-ts/Console';
import { pipe } from 'fp-ts/function';
import * as WT from 'src';
import { errorInfosToString } from 'src/errorInfos';

const runAndLog = <A>(wp: WT.WebProgram<A>) =>
  pipe(
    wp,
    WT.match(
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
