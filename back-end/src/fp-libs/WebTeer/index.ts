import { Page } from "puppeteer";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as RT from "fp-ts/ReaderTask";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
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
export const chainTaskEitherK: <A, B>(
  f: (a: A) => TE.TaskEither<Error, B>
) => (ma: WebProgram<A>) => WebProgram<B> = RTE.chainTaskEitherK;
export const match: <B, A>(
  onLeft: (e: Error) => B,
  onRight: (a: A) => B
) => <R>(ma: WebProgram<A>) => RT.ReaderTask<WebDeps, B> = RTE.match;
/**
 * @category combinators
 */
export const fromTaskK: <A extends readonly unknown[], B>(
  f: (...a: A) => T.Task<B>
) => (...a: A) => WebProgram<B> = RTE.fromTaskK;
/**
 * @category constructors
 */
export const fromTaskEither: <A>(ma: TE.TaskEither<Error, A>) => WebProgram<A> =
  RTE.fromTaskEither;
export const fromEither: <A>(e: E.Either<Error, A>) => WebProgram<A> =
  RTE.fromEither;
/**
 * @category constructors
 */
export const right: <A = never>(a: A) => WebProgram<A> = RTE.right;
/**
 * @category constructors
 */
export const left: <A = never>(e: Error) => WebProgram<A> = RTE.left;
export const anyToError: (err: any) => Error = (err) =>
  err instanceof Error ? err : new Error(JSON.stringify(err));
export const leftAny: <A = never>(err: any) => WebProgram<A> = (err) =>
  fromEither(
    err instanceof Error ? E.left(err) : E.left(new Error(JSON.stringify(err)))
  );
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
export const asks: <A = never>(f: (r: WebDeps) => A) => WebProgram<A> =
  RTE.asks;
export const ask: () => WebProgram<WebDeps> = RTE.ask;
export const orElse: <A>(
  onLeft: (e: Error) => WebProgram<A>
) => (ma: WebProgram<A>) => WebProgram<A> = RTE.orElse;
