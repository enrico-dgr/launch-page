import { WebProgram, chain, chainN } from "../../../index";
import { pipe } from "fp-ts/lib/function";

export interface PlanDeps {
  readonly init: WebProgram<void>;
  readonly routine: WebProgram<void>;
  readonly end: WebProgram<void>;
}
/**
 *
 */
export const plan = (D: PlanDeps) => {
  return pipe(
    D.init,
    chainN<void>(100, 10)(() => D.routine),
    chain(() => D.end)
  );
};
