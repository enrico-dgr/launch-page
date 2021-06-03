import * as WT from "../../../index";
import { pipe } from "fp-ts/lib/function";

export interface InitDeps {
  readonly goToGrowthPlansPage: WT.WebProgram<void>;
  readonly activatePlan: WT.WebProgram<void>;
}
/**
 *
 * @param D
 * @returns The element used to follow.
 */
export const init = (D: InitDeps) => {
  return pipe(
    D.goToGrowthPlansPage,
    WT.chain(() => D.activatePlan)
  );
};
