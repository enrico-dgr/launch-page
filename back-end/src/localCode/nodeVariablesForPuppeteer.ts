import * as IOE from 'fp-ts/IOEither';
import { pipe } from 'fp-ts/lib/function';

/**
 *
 */
// ----------------------------
// Variables
// ----------------------------
/**
 *
 */
type Variables = keyof typeof EnumOfVariables;
enum EnumOfVariables {
  "--user",
}
/**
 * @name users
 */
const users: string[] = ["waverener12", "newmener2", "im_noone1789"];
/**
 *
 */
const validateVariable = (variable: Variables, value: string): string => {
  switch (variable) {
    case "--user":
      const user = users.find((val) => val === value);
      if (user === undefined)
        throw new Error(`Specified user is not available in catalogue.`);
      return user;

    default:
      throw new Error(
        "No variable match. This error should not be representable."
      );
  }
};
/**
 *
 */
export const variables = (variable: Variables) =>
  pipe(
    process.argv,
    (argv) =>
      argv.indexOf(variable) < 0
        ? IOE.left<string, { argv: string[]; indexOfValue: number }>(
            `Expected variable "${variable}" to be specified.`
          )
        : IOE.right<string, { argv: string[]; indexOfValue: number }>({
            argv: argv,
            indexOfValue: argv.indexOf(variable) + 1,
          }),
    IOE.chain(({ argv, indexOfValue }) =>
      argv.length <= indexOfValue
        ? IOE.left(`No value for "${variable}"`)
        : IOE.right(argv[indexOfValue])
    ),
    IOE.match(
      (e) => {
        throw new Error(e);
      },
      (value) => validateVariable(variable, value)
    )
  );
// ----------------------------
// Options
// ----------------------------
/**
 *
 */
type Options = keyof typeof EnumOfOptions;
enum EnumOfOptions {
  "--headless",
  "--setDefaultTimeout",
  "--executablePath",
}
/**
 *
 */
type DefaultOptions = {
  [k in Options]: string;
};
/**
 *
 */
const defaultOptions: DefaultOptions = {
  "--headless": "true",
  "--setDefaultTimeout": "30000",
  "--executablePath": "undefined",
};
/**
 *
 */
const validateOption = (option: Options, value: string): string => {
  switch (option) {
    case "--headless":
      if (value !== "true" && value !== "false")
        throw new Error(
          `--headless mode should be 'true' or 'false'.` + ` You typed ${value}`
        );
      return value;
    case "--setDefaultTimeout":
      if (typeof JSON.parse(value) !== "number")
        throw new Error(
          `--setDefaultTimeout in page should be a number.` +
            ` You typed ${value}`
        );
      return value;
    case "--executablePath":
      return value;

    default:
      throw new Error(
        "No option match. This error should not be representable."
      );
  }
};
/**
 *
 */
export const options = (option: Options) =>
  pipe(
    process.argv,
    (argv) =>
      argv.indexOf(option) < 0
        ? IOE.right<string, string>(defaultOptions[option])
        : pipe(
            IOE.right<string, { argv: string[]; indexOfValue: number }>({
              argv: argv,
              indexOfValue: argv.indexOf(option) + 1,
            }),
            IOE.chain(({ argv, indexOfValue }) =>
              argv.length <= indexOfValue
                ? IOE.left(`No value for "${option}" after flag.`)
                : IOE.right(argv[indexOfValue])
            )
          ),
    IOE.match(
      (e) => {
        throw new Error(e);
      },
      (value) => validateOption(option, value)
    )
  );
/**
 *
 */
export const optionsExecutablePath = () =>
  pipe(options("--executablePath")(), (exPath) =>
    exPath === "undefined" ? undefined : exPath
  );
