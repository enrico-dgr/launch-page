import { WebProgram } from "../../../index";
import { ElementHandle } from "puppeteer";
import { pipe } from "fp-ts/lib/function";
export * from "./FollowedOfProfile";
// $x(`//*[contains(text(),'privato')]`)
// Richiesta effettuata

export interface Deps {
  readonly preAndAfterFollowChecks: WebProgram<void>[];
  readonly preFollowChecks: WebProgram<void>[];
  readonly postFollowChecks: WebProgram<void>[];
  readonly clickFollowButton: WebProgram<void>;
  readonly chain: <A, B>(
    f: (a: A) => WebProgram<B>
  ) => (ma: WebProgram<A>) => WebProgram<B>;
  readonly of: <A = never>(a: A) => WebProgram<A>;
  readonly concatAll: (mas: WebProgram<void>[]) => WebProgram<void>;
}
/**
 *
 * @param D
 * @returns The element used to follow.
 */
export const follow = (D: Deps) => {
  return pipe(
    D.concatAll(D.preFollowChecks),
    D.chain(() => D.concatAll(D.preAndAfterFollowChecks)),
    D.chain(() => D.clickFollowButton),
    D.chain(() => D.concatAll(D.preAndAfterFollowChecks)),
    D.chain((el) =>
      pipe(
        D.concatAll(D.postFollowChecks),
        D.chain(() => D.of(el))
      )
    )
  );
};
