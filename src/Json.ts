/**
 * @since 1.0.0
 */
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as J from 'fp-ts/lib/Json';

/**
 * @ignore
 */
export type Json = J.Json;
/**
 * @since 1.0.0
 */
export const stringify = <A>(a: A) =>
  pipe(
    J.stringify<A>(a),
    E.orElse((u) =>
      pipe(
        E.tryCatch(
          () => new Error(JSON.stringify(u)),
          () => new Error("Not stringifiable error object.")
        ),
        E.chain<Error, Error, string>(E.left)
      )
    )
  );
/**
 * @since 1.0.0
 */
export const parseToFormattedJson = <A>(a: A) =>
  pipe(
    stringify<A>(a),
    E.map((stringified) => JSON.stringify(stringified, null, 2))
  );
/**
 * @since 1.0.0
 */
export const parse = <A extends Json>(s: string) =>
  pipe(
    J.parse(s) as E.Either<unknown, A>,
    E.orElse((u) =>
      pipe(
        E.tryCatch(
          () => (u instanceof Error ? u : new Error(JSON.stringify(u))),
          () => new Error("Not stringifiable error object.")
        ),
        E.chain<Error, Error, A>(E.left)
      )
    )
  );
