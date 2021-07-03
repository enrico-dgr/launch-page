/**
 * @since 1.0.0
 */
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';

/**
 * @since 1.0.0
 */
export const toString = (e: Error) =>
  `Error's name: ${e.name}\n` +
  `Error's message: ${e.message}\n` +
  `Error's stack: ${e.stack}`;
/**
 * @since 1.0.0
 */
export const appendMessage = (mess: string) => (e: Error): Error => ({
  ...e,
  message: e.message + ` :<:<:<: ${mess}`,
});
/**
 * @category constructors
 * @since 1.0.0
 */
export const anyToError = <E, A>(err: E): E.Either<Error, A> =>
  err instanceof Error
    ? E.left(err)
    : pipe(
        E.tryCatch(
          () => new Error(JSON.stringify(err)),
          () => new Error("Failed to convert type any to Error.")
        ),
        E.chain<Error, Error, A>(E.left)
      );
