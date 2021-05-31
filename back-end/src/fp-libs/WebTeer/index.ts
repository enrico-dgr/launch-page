import { Page } from "puppeteer";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as RT from "fp-ts/ReaderTask";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import * as E from "fp-ts/Either";
import * as S from "fp-ts/Semigroup";
import { flow, pipe, Predicate } from "fp-ts/lib/function";

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
export const chainTaskK: <A, B>(
  f: (a: A) => T.Task<B>
) => (first: WebProgram<A>) => WebProgram<B> = RTE.chainTaskK;
export const chainTaskEitherK: <A, B>(
  f: (a: A) => TE.TaskEither<Error, B>
) => (ma: WebProgram<A>) => WebProgram<B> = RTE.chainTaskEitherK;
export const chainFirst: <A, B>(
  f: (a: A) => WebProgram<B>
) => (ma: WebProgram<A>) => WebProgram<A> = RTE.chainFirst;
export const match: <B, A>(
  onLeft: (e: Error) => B,
  onRight: (a: A) => B
) => (ma: WebProgram<A>) => RT.ReaderTask<WebDeps, B> = RTE.match;
export const matchW: <B, A, C>(
  onLeft: (e: Error) => B,
  onRight: (a: A) => C
) => (ma: WebProgram<A>) => RT.ReaderTask<WebDeps, B | C> = RTE.matchW;
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
/**
 *
 * @param millis
 * @returns
 */
export const delay: <A>(millis: number) => (first: A) => WebProgram<A> = (
  millis
) => fromTaskK((a) => T.delay(millis)(T.of(a)));
// const wait = <A>(a: A): T.Task<A> => T.delay(millis)(T.of(a));
/**
 *
 * @param millis n-seconds would be millis/1000 = n
 * @param attempts number of try before returning the real Either, even on *left*
 * @returns
 */
export const tryNTimes: <A, B>(
  millis: number,
  attempts: number
) => (awp: (a: A) => WebProgram<B>) => (a: A) => WebProgram<B> = <A, B>(
  millis: number,
  attempts: number
) => (awp: (a: A) => WebProgram<B>) => (a: A) =>
  pipe(
    a,
    awp,
    orElse((e) =>
      attempts > 1
        ? pipe(
            undefined,
            delay(millis),
            chain(() => tryNTimes<A, B>(millis, attempts - 1)(awp)(a))
          )
        : left(e)
    )
  );
/**
 *
 */
export const repeatNTimes: <A, B>(
  millis: number,
  attempts: number
) => (awp: (a: A) => WebProgram<B>) => (a: A) => WebProgram<B> = <A, B>(
  millis: number,
  numberOfTimes: number
) => (awp: (a: A) => WebProgram<B>) => (a: A) =>
  pipe(
    a,
    awp,
    chain((b) =>
      numberOfTimes > 0
        ? pipe(
            undefined,
            delay(millis),
            chain(() => tryNTimes<A, B>(millis, numberOfTimes - 1)(awp)(a))
          )
        : right(b)
    )
  );
