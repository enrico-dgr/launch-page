import { WebProgram } from "../../../index";
import { pipe } from "fp-ts/lib/function";

export interface RoutineDeps<ProfileType> {
  readonly retrieveProfile: WebProgram<ProfileType>;
  readonly follow: (p: ProfileType) => WebProgram<void>;
  readonly confirm: WebProgram<void>;
  readonly chain: <A, B>(
    f: (a: A) => WebProgram<B>
  ) => (ma: WebProgram<A>) => WebProgram<B>;
}
/**
 *
 */
export const routine = <ProfileType>(D: RoutineDeps<ProfileType>) => {
  return pipe(D.retrieveProfile, D.chain(D.follow));
};
