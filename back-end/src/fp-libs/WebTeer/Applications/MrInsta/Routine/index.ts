import * as WT from "../../../index";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/Semigroup";

export interface RoutineDeps<ProfileType> {
  readonly preRetrieveChecks: WT.WebProgram<void>[];
  readonly retrieveProfile: WT.WebProgram<ProfileType>;
  readonly follow: (p: ProfileType) => WT.WebProgram<void>;
  readonly confirm: WT.WebProgram<void>;
  readonly skip: WT.WebProgram<void>;
}
const concatAll = S.concatAll(WT.getSemigroupChain<void>(WT.chain));
/**
 *
 */
export const routine = <ProfileType>(D: RoutineDeps<ProfileType>) => {
  return pipe(
    concatAll(WT.of(undefined))(D.preRetrieveChecks),
    WT.chainNOrElse<void, void>(
      1000,
      5
    )(() =>
      pipe(
        D.retrieveProfile,
        WT.chain(D.follow),
        WT.orElse((e) =>
          pipe(
            D.skip,
            WT.chain(() => WT.left(e))
          )
        )
      )
    ),
    WT.chain(() => D.confirm)
  );
};
