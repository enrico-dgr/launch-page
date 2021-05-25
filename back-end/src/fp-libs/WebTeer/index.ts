import { Page } from "puppeteer";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as S from "fp-ts/Semigroup";
import { pipe } from "fp-ts/lib/function";
export interface WebDeps {
  page: Page;
}

export interface WebProgram<A>
  extends RTE.ReaderTaskEither<WebDeps, Error, A> {}
/**
 * @category Pointed
 */
export const of: <A = never>(a: A) => WebProgram<A> = RTE.of;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 */
export const chain: <A, B>(
  f: (a: A) => WebProgram<B>
) => (ma: WebProgram<A>) => WebProgram<B> = RTE.chain;
/**
 * @category semigroup instance
 */
export const semigroupCheckLefts: S.Semigroup<WebProgram<void>> = {
  concat: (x, y) =>
    pipe(
      x,
      chain(() => y)
    ),
};
