/**
 * @since 1.0.0
 */
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import fs from 'fs';
import path from 'path';

import { createErrorFromErrorInfos, stackErrorInfos } from './ErrorInfos';
import * as J from './Json';

const PATH = path.resolve(__filename);

/**
 * @since 1.0.0
 */
export const getFromJsonFile = <A extends J.Json>(pathToJsonFile: string) =>
  pipe(
    fs.existsSync(pathToJsonFile)
      ? E.right(undefined)
      : E.left(new Error("File does not exist.")),
    E.chain(() => J.parse(fs.readFileSync(pathToJsonFile, "utf8"))),
    E.orElse<Error, A, Error>(
      flow(
        stackErrorInfos({
          message: "Some error while getting object from a json-file.",
          nameOfFunction: "getFullJson",
          filePath: PATH,
        }),
        E.left
      )
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
    E.orElse<Error, void, Error>(
      flow(
        stackErrorInfos({
          message: "Some error while getting object from a json-file.",
          nameOfFunction: "getFullJson",
          filePath: PATH,
        }),
        E.left
      )
    )
  );
