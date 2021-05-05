import E from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import T from "fp-ts/Task";
import TE from "fp-ts/TaskEither";
import { ElementHandle, HTTPResponse, Page } from "puppeteer";

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
 * Function accepted by the `chain` of this file.
 *
 * @category model
 */
export type SideEffectBall<E, A, B> = (
  ball: Ball<A>,
  right: (ball: Ball<B>) => EitherBall<E, B>,
  left: (e: Error) => EitherBall<E, B>
) => TaskEitherBall<E, B>;
// Other types
export type XPaths = Record<string, string>;
export type Selectors = Record<string, string>;
export type Urls = Record<string, URL>;
/**
 * Abstraction of `chainError`. You can specify
 * the left side type `E` of the `TaskEitherBall<E,A>`
 *
 * @param f
 * @returns
 */
export const chain = <E, A, B>(
  f: (
    ball: Ball<A>,
    right: (b: Ball<B>) => EitherBall<E, B>,
    left: (e: E) => EitherBall<E, B>
  ) => TaskEitherBall<E, B>
): ((tepa: TaskEitherBall<E, A>) => TaskEitherBall<E, B>) =>
  flow(
    T.chain<EitherBall<E, A>, EitherBall<E, B>>(
      E.match<E, Ball<A>, TaskEitherBall<E, B>>(
        (e) => left(e),
        (ball) => f(ball, E.right, E.left)
      )
    )
  );
/**
 *
 * @param f
 * ```
 * f: (
    ball: Ball<A>,
    right: (b: Ball<B>) => EitherBall<B>,
    left: (e: Error) => EitherBall<B>
  ) => TaskEitherBall<B>
  // SAME AS
   f: SideEffectBall<A, B>
 * ```
 * @returns ```
 * (tepa: TaskEitherBall<A>) => TaskEitherBall<B>
 * ```
 * @description 
 * Arguments `left` and `right` are E.left and E.right
 * from "fp-ts/lib/Either", so you don't have to import
 * them in every brand new morphism of `TaskEitherBall<A>`.
 * @types
 * ```
 * interface Ball<A> {
 *  page: Page // from "puppeteer"
 *  a: A 
 * }
 * type EitherBall<A> = Either<Error, Ball<A>>; // from "fp-ts/lib/Either"
 * type TaskEitherBall<A> = TaskEither<Error, Ball<A>>; // from "fp-ts/lib/TaskEither"
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
 *     .catch((error) => {
 *       const err: Error = {
 *         name: "Error name: page.goto(url) throws error.",
 *         message: JSON.stringify(error),
 *       };
 *       return left(err);
 *     })
 * );
 */
export const chainError = <A, B>(f: SideEffectBall<Error, A, B>) =>
  chain<Error, A, B>(f);
// export const goto = chainError<string, HTTPResponse>(
//   ({ page, a: url }: Ball<string>, right, left) => () =>
//     page
//       .goto(url)
//       .then((res) => right({ page, a: res }))
//       .catch((error) => {
//         const err: Error = {
//           name: "Error name: page.goto(url) throws error.",
//           message: JSON.stringify(error),
//         };
//         return left(err);
//       })
// );

/**
 *
 * @param f
 * ```
 * const f: (ball: Ball<A>) => T.Task<B>
 * ```
 * @param errorName
 * ```
 * const errorName: string
 * ```
 * @returns a refactored puppeteer standard `Promise`
 */
export const chainPuSt = <A, B>(
  f: (ball: Ball<A>) => T.Task<B>,
  errorName: string
): ((tepa: TaskEitherBall<Error, A>) => TaskEitherBall<Error, B>) =>
  flow(
    T.chain<EitherBall<Error, A>, EitherBall<Error, B>>(
      E.match<Error, Ball<A>, TaskEitherBall<Error, B>>(
        (e) => left(e),
        (ball) => () =>
          f(ball)()
            .then((b) => E.right({ page: ball.page, a: b }))
            .catch((e) => {
              const err: Error = {
                name: errorName,
                message: JSON.stringify(e),
              };
              return E.left(err);
            })
      )
    )
  );
const goto = chainPuSt(
  ({ page, a: url }: Ball<string>) => () => page.goto(url),
  "Error name: page.goto(url) throws error."
);
const click = chainPuSt(
  ({ page, a: handle }: Ball<ElementHandle<Element>>) => () => handle.click(),
  ``
);
