import * as MrInsta from 'examples/Applications/MrInsta';
import { Input } from 'examples/SocialGift';
import * as IOE from 'fp-ts/IOEither';
import { pipe } from 'fp-ts/lib/function';
import P from 'puppeteer';

import * as NU from './nodeVariablesForPuppeteer';
import { runAndLog } from './runAndLog';

// ----------------------------
// Variables
// ----------------------------
/**
 *
 */
type Variables = keyof typeof EnumOfVariables;
enum EnumOfVariables {
  "--site",
}
/**
 * @name users
 */
const sites: string[] = ["TurboMedia", "MrInsta"];
/**
 *
 */
const validateVariable = (variable: Variables, value: string): string => {
  switch (variable) {
    case "--site":
      const site = sites.find((val) => val === value);
      if (site === undefined)
        throw new Error(`Specified site is not available in catalogue.`);
      return site;

    default:
      throw new Error(
        "No variable match. This error should not be representable."
      );
  }
};
/**
 *
 */
const variables = (variable: Variables) =>
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

const freeFollowerPlan = MrInsta.freeFollowerPlan;

/**
 * Main
 */
(async () => {
  const browser = await P.launch(NU.launchOptions);
  const page = await browser.newPage();

  await pipe(
    { page },
    runAndLog(
      freeFollowerPlan(variables("--site")() as "MrInsta" | "TurboMedia")
    )
  )();
})();
