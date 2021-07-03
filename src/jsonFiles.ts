/**
 * @since 1.0.0
 */
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import fs from 'fs';

import * as J from './Json';

/**
 * @since 1.0.0
 */
export const getFromJsonFile = <A extends J.Json>(pathToJsonFile: string) =>
  pipe(
    fs.existsSync(pathToJsonFile)
      ? E.right(undefined)
      : E.left(new Error("File does not exist.")),
    E.chain(() => J.parse(fs.readFileSync(pathToJsonFile, "utf8"))),
    E.orElse<Error, A, Error>((e) =>
      E.left({
        ...e,
        message: "Some error while reading a json-file." + e.message,
      })
    )
  );
/**
 * @since 1.0.0
 */
export const postToJsonFile = <A extends J.Json>(pathToJsonFile: string) => (
  a: A
) =>
  pipe(
    J.parseToFormattedJson(a),
    E.map((strinfied) => fs.writeFileSync(pathToJsonFile, strinfied)),
    E.orElse<Error, void, Error>((e) =>
      E.left({
        ...e,
        message: "Some error while getting writing to a json-file." + e.message,
      })
    )
  );
