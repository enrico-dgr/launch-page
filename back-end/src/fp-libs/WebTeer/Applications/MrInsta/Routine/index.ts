import {
  WebProgram,
  orElse,
  chain,
  chainTaskK,
  chainNOrElse,
  left,
  delay,
} from "../../../index";
import { pipe } from "fp-ts/lib/function";

export interface RoutineDeps<ProfileType> {
  readonly preRetrieveChecks: WebProgram<void>[];
  readonly retrieveProfile: WebProgram<ProfileType>;
  readonly follow: (p: ProfileType) => WebProgram<void>;
  readonly confirm: WebProgram<void>;
  readonly skip: WebProgram<void>;
  readonly concatAll: (mas: WebProgram<void>[]) => WebProgram<void>;
}
/**
 * @todo check the 'ciao' log. Because now it's working.
 */
export const routine = <ProfileType>(D: RoutineDeps<ProfileType>) => {
  return pipe(
    D.concatAll(D.preRetrieveChecks),
    chainNOrElse<void, void>(
      1000,
      5
    )(() =>
      pipe(
        D.retrieveProfile,
        chain(D.follow),
        orElse((e) =>
          pipe(
            D.skip,
            chainTaskK(() => () =>
              new Promise((resolve) => resolve(console.log("Ciao!")))
            ),
            chain(() => left(e))
          )
        )
      )
    ),
    chain(() => D.confirm)
  );
};
