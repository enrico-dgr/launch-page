import { flow, pipe } from 'fp-ts/lib/function';

import * as WT from '../../../WebProgram';

const dummyRepeat: <A>(
  millis: number,
  numberOfTimes: number
) => (awp: (a: A) => WT.WebProgram<A>) => (a: A) => WT.WebProgram<A> = <A>(
  millis: number,
  numberOfTimes: number
) => (awp: (a: A) => WT.WebProgram<A>) =>
  flow(
    awp,
    WT.chain((a) =>
      numberOfTimes > 1
        ? pipe(
            undefined,
            WT.delay(millis),
            WT.chain(() => dummyRepeat<A>(millis, numberOfTimes - 1)(awp)(a))
          )
        : WT.right(a)
    )
  );

const chainNTimes: <A>(
  millis: number,
  numberOfTimes: number
) => (
  awp: (a: A) => WT.WebProgram<A>
) => (wp: WT.WebProgram<A>) => WT.WebProgram<A> = <A>(
  millis: number,
  numberOfTimes: number
) => (awp: (a: A) => WT.WebProgram<A>) => (wp: WT.WebProgram<A>) =>
  pipe(wp, WT.chain(dummyRepeat<A>(millis, numberOfTimes)(awp)));
export interface PlanDeps {
  readonly init: WT.WebProgram<void>;
  readonly routine: WT.WebProgram<void>;
  readonly end: WT.WebProgram<void>;
}
/**
 *
 */
export const plan = (D: PlanDeps) => {
  return pipe(
    D.init,
    chainNTimes<void>(100, 10)(() => D.routine),
    WT.chain(() => D.end)
  );
};
