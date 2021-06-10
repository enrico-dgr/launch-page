import { pipe } from 'fp-ts/lib/function';
import * as S from 'fp-ts/lib/Semigroup';

import * as WT from '../../../../index';

const concatAll = S.concatAll(WT.getSemigroupChain<void>(WT.chain));

export interface FollowDeps<DepsToFollow> {
  readonly preFollowChecks: (dtf: DepsToFollow) => WT.WebProgram<void>[];
  readonly postFollowChecks: (dtf: DepsToFollow) => WT.WebProgram<void>[];
  readonly clickFollowButton: (dtf: DepsToFollow) => WT.WebProgram<void>;
}

export const getFollow = <DepsToFollow>(D: FollowDeps<DepsToFollow>) => (
  dtf: DepsToFollow
) =>
  pipe(
    concatAll(() => WT.of(undefined))(
      D.preFollowChecks(dtf).map((c) => () => c)
    )(),
    WT.chain(() => D.clickFollowButton(dtf)),
    WT.chain(() =>
      concatAll(() => WT.of(undefined))(
        D.postFollowChecks(dtf).map((c) => () => c)
      )()
    )
  );
