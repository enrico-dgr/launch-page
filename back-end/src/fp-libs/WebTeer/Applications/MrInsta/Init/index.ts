import { WebProgram } from "../../../index";
import { pipe } from "fp-ts/lib/function";

export interface InitDeps {
  readonly goToGrowthPlansPage: WebProgram<void>;
  readonly activatePlan: WebProgram<void>;
  readonly chain: <A, B>(
    f: (a: A) => WebProgram<B>
  ) => (ma: WebProgram<A>) => WebProgram<B>;
}
/**
 *
 * @param D
 * @returns The element used to follow.
 */
export const init = (D: InitDeps) => {
  return pipe(
    D.goToGrowthPlansPage,
    D.chain(() => D.activatePlan)
  );
};
