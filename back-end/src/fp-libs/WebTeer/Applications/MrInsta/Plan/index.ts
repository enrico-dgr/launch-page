import * as WT from "../../../index";
import { pipe } from "fp-ts/lib/function";

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
    WT.chainN<void>(100, 10)(() => D.routine),
    WT.chain(() => D.end)
  );
};
