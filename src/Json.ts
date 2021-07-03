/**
 * @since 1.0.0
 */
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as J from 'fp-ts/lib/Json';

import * as EU from './ErrorUtils';

/**
 * @ignore
 */
export type Json = J.Json;
/**
 * @since 1.0.0
 */
export const stringify = <A>(a: A): E.Either<Error, string> =>
  pipe(
    J.stringify<A>(a),
    E.orElse((e) => EU.anyToError(e))
  );
/**
 * @since 1.0.0
 */
export const parseToFormattedJson = <A>(a: A) =>
  pipe(
    stringify<A>(a),
    E.map((stringified) => JSON.stringify(JSON.parse(stringified), null, 2))
  );
/**
 * @since 1.0.0
 */
export const parse = <A extends Json>(s: string): E.Either<Error, A> =>
  pipe(
    J.parse(s) as E.Either<unknown, A>,
    E.orElse((e) => EU.anyToError(e))
  );
