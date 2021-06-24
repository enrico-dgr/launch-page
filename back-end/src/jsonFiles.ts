import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import fs from 'fs';
import path from 'path';

import { stackErrorInfos } from './ErrorInfos';
import * as J from './Json';

const PATH = path.resolve(__dirname, "./jsonFiles.ts");

/**
 *
 */
export const getFromJsonFile = <A extends J.Json>(pathToJsonFile: string) =>
  pipe(
    J.parse(fs.readFileSync(pathToJsonFile, "utf8")) as E.Either<unknown, A>,
    E.orElse<unknown, A, Error>((u) =>
      pipe(
        J.stringify(u),
        E.chain((e) => E.left(new Error(e)))
      )
    ),
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
 *
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
