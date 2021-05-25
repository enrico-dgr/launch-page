import { WebDeps, WebProgram } from "../../index";
import { ElementHandle } from "puppeteer";
import { flow, pipe } from "fp-ts/lib/function";
export * from "./FollowedOfProfile";
// $x(`//*[contains(text(),'privato')]`)
// Richiesta effettuata

interface Deps {
  readonly preFollowChecks: WebProgram<void>[];
  readonly follow: WebProgram<ElementHandle<Element>>;
  readonly postFollowChecks: (el: ElementHandle<Element>) => WebProgram<void>[];
  readonly chain: <A, B>(
    f: (a: A) => WebProgram<B>
  ) => (ma: WebProgram<A>) => WebProgram<B>;
  readonly of: <A = never>(a: A) => WebProgram<A>;
  readonly concatAll: <A>(mas: WebProgram<void>[]) => WebProgram<void>;
}
/**
 *
 * @param D
 * @returns The element used to follow.
 */
export const follow = (D: Deps) => {
  return pipe(
    D.concatAll(D.preFollowChecks),
    D.chain(() => D.follow),
    D.chain((el) =>
      pipe(
        D.concatAll(D.postFollowChecks(el)),
        D.chain(() => D.of(el))
      )
    )
  );
};
