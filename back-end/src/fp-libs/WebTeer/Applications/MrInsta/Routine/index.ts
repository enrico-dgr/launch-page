import { WebProgram } from "../../../index";
import { pipe } from "fp-ts/lib/function";

export interface Deps {
  readonly chain: <A, B>(
    f: (a: A) => WebProgram<B>
  ) => (ma: WebProgram<A>) => WebProgram<B>;
  readonly of: <A = never>(a: A) => WebProgram<A>;
}
/**
 *
 * @param D
 * @returns The element used to follow.
 */
export const follow = (D: Deps) => {};
