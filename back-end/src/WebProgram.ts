/**
 * @since 1.0.0
 */
import * as E from 'fp-ts/Either';
import * as IO from 'fp-ts/IO';
import { flow, pipe, Predicate } from 'fp-ts/lib/function';
import * as RT from 'fp-ts/ReaderTask';
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as S from 'fp-ts/Semigroup';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';

import { anyToError, createErrorFromErrorInfos, ErrorInfos, stackErrorInfos } from './ErrorInfos';
import { WebDeps } from './WebDeps';

/**
 * @category model
 * @since 1.0.0
 */
export interface WebProgram<A>
  extends RTE.ReaderTaskEither<WebDeps, Error, A> {}
/**
 * @category Pointed
 * @since 1.0.0
 */
export const of: <A = never>(a: A) => WebProgram<A> = RTE.of;
/**
 * @category — Functor
 * @since 1.0.0
 */
export const map: <A, B>(
  f: (a: A) => B
) => (fa: WebProgram<A>) => WebProgram<B> = RTE.map;
/**
 * @category Monad
 * @since 1.0.0
 */
export const chain: <A, B>(
  f: (a: A) => WebProgram<B>
) => (ma: WebProgram<A>) => WebProgram<B> = RTE.chain;
/**
 * @category combinators
 * @since 1.0.0
 */
export const chainAdd: <A, B>(
  f: (a: A) => WebProgram<B>
) => (ma: WebProgram<A>) => WebProgram<A & B> = (f) =>
  chain((a) =>
    pipe(
      f(a),
      RTE.chain((b) => of({ ...a, ...b }))
    )
  );
/**
 * @category combinators
 * @since 1.0.0
 */
export const chainTaskK: <A, B>(
  f: (a: A) => T.Task<B>
) => (first: WebProgram<A>) => WebProgram<B> = RTE.chainTaskK;
/**
 * @category combinators
 * @since 1.0.0
 */
export const chainTaskEitherK: <A, B>(
  f: (a: A) => TE.TaskEither<Error, B>
) => (ma: WebProgram<A>) => WebProgram<B> = RTE.chainTaskEitherK;
/**
 * @category combinators
 * @since 1.0.0
 */
export const chainFirst: <A, B>(
  f: (a: A) => WebProgram<B>
) => (ma: WebProgram<A>) => WebProgram<A> = RTE.chainFirst;
/**
 * @category destructors
 * @since 1.0.0
 */
export const match: <B, A>(
  onLeft: (e: Error) => B,
  onRight: (a: A) => B
) => (ma: WebProgram<A>) => RT.ReaderTask<WebDeps, B> = RTE.match;
/**
 * @category destructors
 * @since 1.0.0
 */
export const matchW: <B, A, C>(
  onLeft: (e: Error) => B,
  onRight: (a: A) => C
) => (ma: WebProgram<A>) => RT.ReaderTask<WebDeps, B | C> = RTE.matchW;
/**
 * @category combinators
 * @since 1.0.0
 */
export const fromTaskK: <A extends readonly unknown[], B>(
  f: (...a: A) => T.Task<B>
) => (...a: A) => WebProgram<B> = RTE.fromTaskK;
/**
 * @since 1.0.0
 */
export const fromIO: <A>(fa: IO.IO<A>) => WebProgram<A> = RTE.fromIO;
/**
 * @category constructors
 * @since 1.0.0
 */
export const fromTaskEither: <A>(ma: TE.TaskEither<Error, A>) => WebProgram<A> =
  RTE.fromTaskEither;
/**
 * @category constructors
 * @since 1.0.0
 */
export const fromEither: <A>(e: E.Either<Error, A>) => WebProgram<A> =
  RTE.fromEither;
/**
 * @category constructors
 * @since 1.0.0
 */
export const right: <A = never>(a: A) => WebProgram<A> = RTE.right;
/**
 * @category constructors
 * @since 1.0.0
 */
export const left: <A = never>(e: Error) => WebProgram<A> = RTE.left;
/**
 * @category constructors
 * @since 1.0.0
 */
export const leftAny: <E = never, A = never>(err: E) => WebProgram<A> = (err) =>
  fromEither(anyToError(err));
/**
 * @category constructors
 * @since 1.0.0
 */
export const leftFromErrorInfos = <A = never>(
  errorInfos: ErrorInfos
): WebProgram<A> => left(createErrorFromErrorInfos(errorInfos));
/**
 * @category instances
 * @since 1.0.0
 */
export const getSemigroupChain = <A>(
  chain_: (f: (a: A) => WebProgram<A>) => (ma: WebProgram<A>) => WebProgram<A>
): S.Semigroup<(a: A) => WebProgram<A>> => ({
  concat: (x, y) => flow(x, chain_(y)),
});

/**
 * @category constructors
 * @since 1.0.0
 */
export const fromPredicate: <A>(
  predicate: Predicate<A>,
  onFalse: (a: A) => Error
) => (a: A) => WebProgram<A> = RTE.fromPredicate;
/**
 * @category constructors
 * @since 1.0.0
 */
export const asks: <A = never>(f: (r: WebDeps) => A) => WebProgram<A> =
  RTE.asks;
/**
 * @category constructors
 * @since 1.0.0
 */
export const ask: () => WebProgram<WebDeps> = RTE.ask;
/**
 * @category combinators
 * @since 1.0.0
 */
export const orElse: <A>(
  onLeft: (e: Error) => WebProgram<A>
) => (ma: WebProgram<A>) => WebProgram<A> = RTE.orElse;
/**
 * @category combinators
 * @since 1.0.0
 */
export const orElseW: <B>(
  onLeft: (e: Error) => WebProgram<B>
) => <A>(ma: WebProgram<A>) => WebProgram<B | A> = RTE.orElseW;
/**
 * @category combinators
 * @since 1.0.0
 */
export const orElseStackErrorInfos = <A>(errorInfos: ErrorInfos) => (
  ma: WebProgram<A>
): WebProgram<A> =>
  orElse<A>((e: Error) => left(stackErrorInfos(errorInfos)(e)))(ma);
/**
 * @category combinators
 * @since 1.0.0
 */
export const delay: <A>(millis: number) => (first: A) => WebProgram<A> = (
  millis
) => fromTaskK((a) => T.delay(millis)(T.of(a)));
