import * as E from 'fp-ts/Either';
import { flow, pipe, Predicate } from 'fp-ts/lib/function';
import * as RT from 'fp-ts/ReaderTask';
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as S from 'fp-ts/Semigroup';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { Page } from 'puppeteer';

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
 * @category combinators
 */
export const chainTaskK: <A, B>(
  f: (a: A) => T.Task<B>
) => (first: WebProgram<A>) => WebProgram<B> = RTE.chainTaskK;
/**
 * @category combinators
 */
export const chainTaskEitherK: <A, B>(
  f: (a: A) => TE.TaskEither<Error, B>
) => (ma: WebProgram<A>) => WebProgram<B> = RTE.chainTaskEitherK;
/**
 * @category combinators
 */
export const chainFirst: <A, B>(
  f: (a: A) => WebProgram<B>
) => (ma: WebProgram<A>) => WebProgram<A> = RTE.chainFirst;
/**
 * @category destructors
 */
export const match: <B, A>(
  onLeft: (e: Error) => B,
  onRight: (a: A) => B
) => (ma: WebProgram<A>) => RT.ReaderTask<WebDeps, B> = RTE.match;
/**
 * @category destructors
 */
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
/**
 * @category constructors
 */
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
/**
 * @category constructors
 */
export const anyToError: <E>(err: E) => Error = (err) =>
  err instanceof Error ? err : new Error(JSON.stringify(err));
/**
 * Derivable from `anyToError`
 * @category constructors
 */
export const leftAny: <E = never, A = never>(err: E) => WebProgram<A> = (err) =>
  fromEither(
    err instanceof Error ? E.left(err) : E.left(new Error(JSON.stringify(err)))
  );
/**
 * @category semigroup instance
 */

export const getSemigroupChain: <A>(
  chain_: typeof chain
) => S.Semigroup<WebProgram<A>> = (chain_) => ({
  concat: (x, y) =>
    pipe(
      x,
      chain_(() => y)
    ),
});
/**
 * @category constructors
 */
export const fromPredicate: <A>(
  predicate: Predicate<A>,
  onFalse: (a: A) => Error
) => (a: A) => WebProgram<A> = RTE.fromPredicate;
/**
 * @category constructors
 */
export const asks: <A = never>(f: (r: WebDeps) => A) => WebProgram<A> =
  RTE.asks;
/**
 * @category constructors
 */
export const ask: () => WebProgram<WebDeps> = RTE.ask;
/**
 * @category combinators
 */
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
/**
 *
 * @todo The following functions could be more abstract.
 * Consider change them before adding new similar.
 * --------------------------- Start ---------------------------
 */
/**
 * function to be run a maximum of *N* times and stops when result is *right*
 * or after the max attempts reached, exiting with *left* value.
 * @param millis delay between attempts
 *
 * *NOTE* the first attempt will run immediately
 * @param attempts
 * @returns
 */
const nOrElse: <A, B>(
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
            chain(() => nOrElse<A, B>(millis, attempts - 1)(awp)(a))
          )
        : left(e)
    )
  );
/**
 * chain a function to be run a maximum of *N* times and stops when result is *right*
 * or after the max attempts reached, exiting with *left* value.
 * @param millis delay between attempts
 *
 * *NOTE* the first attempt will run immediately
 * @param attempts
 * @returns
 */
export const chainNOrElse: <A, B>(
  millis: number,
  attempts: number
) => (awp: (a: A) => WebProgram<B>) => (wp: WebProgram<A>) => WebProgram<B> = <
  A,
  B
>(
  millis: number,
  attempts: number
) => (awp: (a: A) => WebProgram<B>) => (wp: WebProgram<A>) =>
  pipe(wp, chain(nOrElse<A, B>(millis, attempts)(awp)));
/**
 * function to be run a maximum of *N* times and stops when result is *left*
 * or after the max attempts reached, exiting with *right* value.
 *
 * The result of each cycle will be passed as argument to the next.
 * @param millis delay between attempts
 *
 * *NOTE* the first attempt will run immediately
 * @param attempts
 * @returns the result of the last cycle (*right* or *left*)
 */
const dummyRepeat: <A>(
  millis: number,
  numberOfTimes: number
) => (awp: (a: A) => WebProgram<A>) => (a: A) => WebProgram<A> = <A>(
  millis: number,
  numberOfTimes: number
) => (awp: (a: A) => WebProgram<A>) =>
  flow(
    awp,
    chain((a) =>
      numberOfTimes > 1
        ? pipe(
            undefined,
            delay(millis),
            chain(() => dummyRepeat<A>(millis, numberOfTimes - 1)(awp)(a))
          )
        : right(a)
    )
  );
/**
 * chain a function to be run a maximum of *N* times and stops when result is *left*
 * or after the max attempts reached, exiting with *right* value.
 *
 * The result of each cycle will be passed as argument to the next.
 * @param millis delay between attempts
 *
 * *NOTE* the first attempt will run immediately
 * @param attempts
 * @returns the result of the last cycle (*right* or *left*)
 */
export const chainN: <A>(
  millis: number,
  numberOfTimes: number
) => (awp: (a: A) => WebProgram<A>) => (wp: WebProgram<A>) => WebProgram<A> = <
  A
>(
  millis: number,
  numberOfTimes: number
) => (awp: (a: A) => WebProgram<A>) => (wp: WebProgram<A>) =>
  pipe(wp, chain(dummyRepeat<A>(millis, numberOfTimes)(awp)));
/**
 * --------------------------- End ---------------------------
 */
