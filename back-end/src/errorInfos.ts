/**
 * @since 1.0.0
 */
import { format } from 'prettier';

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
 * @since 1.0.0
 */
export const errorInfosToString = (e: Error) =>
  format(e.message, { parser: "json" }) + "\n Source path:" + e.stack ?? "";
