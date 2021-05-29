import { Page } from "puppeteer";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as S from "fp-ts/Semigroup";
import { pipe, Predicate } from "fp-ts/lib/function";

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

export const fromTaskEither: <A>(ma: TE.TaskEither<Error, A>) => WebProgram<A> =
  RTE.fromTaskEither;
/**
 * @category constructors
 */
export const right: <A = never>(a: A) => WebProgram<A> = RTE.right;
/**
 * @category constructors
 */
export const left: <A = never>(e: Error) => WebProgram<A> = RTE.left;
export const leftAny: <A = never>(err: any) => E.Either<Error, A> = (err) =>
  err instanceof Error ? E.left(err) : E.left(new Error(JSON.stringify(err)));
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
export const fromPredicate: <A>(
  predicate: Predicate<A>,
  onFalse: (a: A) => Error
) => (a: A) => WebProgram<A> = RTE.fromPredicate;
