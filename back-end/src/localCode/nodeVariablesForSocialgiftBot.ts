import * as IOE from 'fp-ts/IOEither';
import { pipe } from 'fp-ts/lib/function';
import * as P from 'puppeteer';
import { Input } from 'src/SocialGift';

/**
 *
 */

// ----------------------------
// Options
// ----------------------------
/**
 *
 */
type Options = keyof typeof EnumOfOptions;
enum EnumOfOptions {
  "--skip-follow",
  "--skip-like",
  "--skip-story",
  "--delay",
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
  "--skip-follow": "false",
  "--skip-like": "false",
  "--skip-story": "false",
  "--delay": String(3 * 60 * 1000),
};
/**
 *
 */
const validateOption = (option: Options, value: string): string => {
  switch (option) {
    case "--skip-follow":
      if (value !== "true" && value !== "false")
        throw new Error(
          `--skip-follow should be 'true' or 'false'.` + ` You typed ${value}`
        );
      return value;

    case "--skip-like":
      if (value !== "true" && value !== "false")
        throw new Error(
          `--skip-like should be 'true' or 'false'.` + ` You typed ${value}`
        );
      return value;

    case "--skip-story":
      if (value !== "true" && value !== "false")
        throw new Error(
          `--skip-story mode should be 'true' or 'false'.` +
            ` You typed ${value}`
        );
      return value;
    case "--delay":
      if (Number(value) === NaN)
        throw new Error(
          `--delay mode should be a number.` + ` You typed ${value}`
        );
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

// ----------------------------
// Option of Input
// ----------------------------
export const optionsOfInput = {
  skip: {
    Follow: JSON.parse(options("--skip-follow")()) as boolean,
    Like: JSON.parse(options("--skip-like")()) as boolean,
    Comment: true,
    WatchStory: JSON.parse(options("--skip-story")()) as boolean,
    Extra: true,
  },
  delayBetweenCycles: JSON.parse(options("--delay")()) as number,
};
