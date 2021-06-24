import { pipe } from 'fp-ts/lib/function';

import * as WT from '../../../WebProgram';

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
