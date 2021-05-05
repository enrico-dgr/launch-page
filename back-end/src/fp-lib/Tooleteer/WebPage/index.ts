import E from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import T from "fp-ts/Task";
import TE from "fp-ts/TaskEither";
import { Page } from "puppeteer";

/**
 * @category model
 */
export interface Ball<A> {
  page: Page;
  a: A;
}
/**
 * @category model
 */
type EitherBall<E, A> = E.Either<E, Ball<A>>;
/**
 * @category model
 */
type TaskEitherBall<E, A> = TE.TaskEither<E, Ball<A>>;
/**
 * Constructs a new `TaskEitherBall<A>` holding a `Left` value.
 * This usually represents a failure,
 * due to the right-bias of this structure.
 *
 * @category constructors
 */
export const left = <E, A>(e: E): TaskEitherBall<E, A> => TE.left(e);
/**
 * Constructs a new `TaskEitherBall<A>` holding a `Right` value.
 * This usually represents a successful value,
 * due to the right bias of this structure.
 *
 * @category constructors
 */
export const right = <E, A>(ball: Ball<A>): TaskEitherBall<E, A> =>
  TE.fromEither<E, Ball<A>>(E.right(ball));
/**
 * @category destructors
 */
export const match = <E, B, A>(
  onLeft: (e: E) => B,
  onRight: (a: Ball<A>) => B
): ((ma: TaskEitherBall<E, A>) => T.Task<B>) => TE.match(onLeft, onRight);
/**
 * @category model
 */
export type XPaths = Record<string, string>;
/**
 * @category model
 */
export type Selectors = Record<string, string>;
/**
 * @category model
 */
export type Urls = Record<string, URL>;
/**
 * Abstraction of `chain`. You can specify
 * the left side type `E` of the `TaskEitherBall<E,A>`
 *
 * @param f
 * @returns
 */
export const chainE = <E, A, B>(
  f: (ball: Ball<A>) => TaskEitherBall<E, B>
): ((tepa: TaskEitherBall<E, A>) => TaskEitherBall<E, B>) =>
  flow(
    T.chain<EitherBall<E, A>, EitherBall<E, B>>(
      E.match<E, Ball<A>, TaskEitherBall<E, B>>(
        (e) => left(e),
        (ball) => f(ball)
      )
    )
  );

/**
 * Eventual error will fall through a pipe, without any execution.
 * 
 * @param f
 * ```
 * f: (
    ball: Ball<A>,
    right: (b: Ball<B>) => EitherBall<B>,
    left: (e: Error) => EitherBall<B>
  ) => TaskEitherBall<Error, B>
  // SAME AS
   f: SideEffectBall<Error, A, B>
 * ```
 * @returns ```
 * (tepa: TaskEitherBall<Error, A>) => TaskEitherBall<Error, B>
 * ```
 * @description 
 * Arguments `left` and `right` are E.left and E.right
 * from "fp-ts/lib/Either", so you don't have to import
 * them in every brand new morphism of `TaskEitherBall<Error, A>`.
 * @types
 * ```
 * interface Ball<A> {
 *  page: Page // from "puppeteer"
 *  a: A 
 * }
 * type EitherBall<E, A> = Either<E, Ball<A>>; // from "fp-ts/lib/Either"
 * type TaskEitherBall<E, A> = TaskEither<E, Ball<A>>; // from "fp-ts/lib/TaskEither"
 * ```
 * @example
 * flow(
 *  chain<A,B>(({page, a:A}:Ball<A>, right, left) => () => 
 *    page.goto()
 *    .then(() => {... 
 *      return right<Error,Ball<B>>(res) // OR
 *      return left<Error,Ball<B>>(err)
 *    })
 *    .catch((err: Error) => left<Error,Ball<B>>(err))),
 *  chain<B,C>(...),
 *  chain<C,D>(...),
 *  ...
 * )
 * @example
 * // same result as `goto` in this file
 * const gotoRefactoring = chainError<string, HTTPResponse>(
 * ({ page, a: url }: Ball<string>, right, left) => () =>
 *   page
 *     .goto(url)
 *     .then((res) => right({ page, a: res }))
 *     .catch((e) => {
 *       const err: Error = {
 *         name: "Error name: page.goto(url) throws error.",
 *         message: JSON.stringify(e),
 *       };
 *       return left(err);
 *     })
 * );
 */
export const chain = <A, B>(f: (ball: Ball<A>) => TaskEitherBall<Error, B>) =>
  chainE<Error, A, B>(f);

/**
 * Will left the Either only on `catch`.
 * Every good result for puppeteer will be `right`.
 *
 * @param f
 * ```
 * const f: (ball: Ball<A>) => Promise<B>
 * ```
 * @param errorName
 * @returns
 * @example
 * ```
 * // Refactoring puppeteer page.goto
 * const goto = chain(
 *  fromPuppeteer(
 *    ({page, a: url}: Ball<string>) => page.goto(url),
 *    "Error name: page.goto(url) throws error."
 *  )
 * )
 * ```
 */
export const fromPuppeteer = <A, B>(
  f: (ball: Ball<A>) => Promise<B>,
  errorName: string
): ((ball: Ball<A>) => TaskEitherBall<Error, B>) => (ball) => () =>
  f(ball)
    .then((b) => E.right<Error, Ball<B>>({ ...ball, a: b }))
    .catch((e) => {
      const err: Error = {
        name: errorName,
        message: JSON.stringify(e),
      };

      return E.left<Error, Ball<B>>(err);
    });
/**
 * From function `fromPuppeteer()`:
 *
 * *"Will left the Either only on `catch`.
 * Every good result for puppeteer will be `right`."*
 * ```
 * f => chain(fromPuppeteer(f))
 * ```
 */
export const chainFromPuppeteer = flow(fromPuppeteer, chain);
