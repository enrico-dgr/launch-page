import { WebProgram, chain } from "../../../index";
import { pipe } from "fp-ts/lib/function";

export interface PlanDeps {
  readonly init: WebProgram<void>;
  readonly routine: WebProgram<void>;
}
/**
 *
 */
export const routine = (D: PlanDeps) => {
  return pipe(D.init);
};
