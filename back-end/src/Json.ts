import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import * as J from 'fp-ts/lib/Json';
import path from 'path';
import { format } from 'prettier';

const PATH = path.resolve(__filename);
/**
 *
 */
export type Json = J.Json;
/**
 *
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
 *
 */
export const parseToFormattedJson = <A>(a: A) =>
  pipe(
    stringify<A>(a),
    E.map((stringified) => format(stringified, { parser: "json-stringify" }))
  );
/**
 *
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
