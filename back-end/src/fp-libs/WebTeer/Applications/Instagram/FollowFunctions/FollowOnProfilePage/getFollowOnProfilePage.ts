import * as WT from "../../../../index";
import { pipe } from "fp-ts/lib/function";

export interface FollowOnProfilePageDeps<DepsToFollow> {
  readonly getDepsToFollow: WT.WebProgram<DepsToFollow>;
  readonly follow: (dtf: DepsToFollow) => WT.WebProgram<void>;
}
export const getFollowOnProfilePage = <DepsToFollow>(
  D: FollowOnProfilePageDeps<DepsToFollow>
) =>
  pipe(
    D.getDepsToFollow,
    WT.chain((dtf) => D.follow(dtf))
  );
