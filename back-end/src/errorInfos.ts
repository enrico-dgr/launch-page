import * as C from 'fp-ts/Console';
/**
 * @since 1.0.0
 */
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import * as path from 'path';
import { format } from 'prettier';
import * as J from 'WebTeer/Json';

const PATH = path.resolve(__dirname, "./errorInfos.ts");
/**
 * @since 1.0.0
 */
export type ErrorInfos = {
  filePath: string;
  nameOfFunction: string;
  message: string;
};
/**
 * @since 1.0.0
 */
export const toString = (e: Error) => {
  const destructError = (name: string, message: string, stack: string = "") =>
    `Error's name: ${name}\n` +
    `Error's message: ${message}\n` +
    `Error's stack: ${stack}`;
  return E.tryCatch(
    () =>
      destructError(
        e.name,
        format(e.message, { parser: "json-stringify" }),
        e.stack
      ),
    (err) => {
      C.warn(
        `### NOTE: error's message has not been formatted because it is not a valid ` +
          `stringified json. Consider using 'stackErrorInfos' in file errorInfos.ts or similar tools.\n` +
          `Format's error: ${err} ###\n`
      )();
      return destructError(e.name, e.message, e.stack);
    }
  );
};
/**
 * @since 1.0.0
 */
export const createErrorFromErrorInfos = (errorInfos: ErrorInfos): Error => ({
  message: JSON.stringify([
    {
      message: errorInfos.message,
      nameOfFunction: errorInfos.nameOfFunction,
      filePath: errorInfos.filePath,
    } as ErrorInfos,
  ]),
  name: "Error",
  stack: "(" + errorInfos.filePath + ")",
});
/**
 * @since 1.0.0
 */
export const stackErrorInfos = (errorInfos: ErrorInfos) => (
  e: Error
): Error => {
  try {
    let tryToParseOrThrowOtherwise = JSON.parse(e.message);
    return {
      message: e.message.replace(
        "[",
        "[" +
          JSON.stringify({
            message: errorInfos.message,
            nameOfFunction: errorInfos.nameOfFunction,
            filePath: errorInfos.filePath,
          } as ErrorInfos) +
          ","
      ),
      name: e.name,
      stack: e.stack,
    };
  } catch (error) {
    return {
      message: JSON.stringify([
        {
          message: errorInfos.message,
          nameOfFunction: errorInfos.nameOfFunction,
          filePath: errorInfos.filePath,
        } as ErrorInfos,
        { messageNotFromJSON: e.message },
      ]),

      name: e.name,
      stack: e.stack,
    };
  }
};

/**
 * @category constructors
 * @since 1.0.0
 */
export const anyToError: <E, A>(err: E) => E.Either<Error, A> = (err) =>
  pipe(
    err instanceof Error
      ? E.left(err)
      : pipe(
          J.stringify(err),
          E.chain((stringified) => E.left(new Error(stringified)))
        ),
    E.orElse(
      flow(
        stackErrorInfos({
          message: "Failed to convert type any to Error",
          nameOfFunction: "anyToError",
          filePath: PATH,
        }),
        E.left
      )
    )
  );
