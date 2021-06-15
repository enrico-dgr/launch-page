export type ErrorInfos = {
  filePath: string;
  nameOfFunction: string;
  message: string;
};
/**
 * @category constructors
 */
export const createErrorFromErrorInfos = (
  errorInfos: ErrorInfos,
  pathToFile: string
): Error => ({
  message: JSON.stringify([
    {
      message: errorInfos.message,
      nameOfFunction: errorInfos.nameOfFunction,
      filePath: errorInfos.filePath,
    } as ErrorInfos,
  ]),
  name: "Error",
  stack: "(" + pathToFile + ")",
});
/**
 * @category combinators
 */
export const stackErrorInfos = (errorInfos: ErrorInfos) => (
  e: Error
): Error => {
  try {
    let tryToParse = JSON.parse(e.message);
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
