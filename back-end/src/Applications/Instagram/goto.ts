import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import * as S from 'fp-ts/Semigroup';
import { $x, goto as gotoWD } from 'src//dependencies';
import * as WT from 'src/index';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'src/settingsByLanguage';

import { Settings, settingsByLanguage } from './SettingsByLanguage';

/**
 *
 */
export type StateOfInstagramPage =
  | "AvailablePage"
  | "NotAvailablePage"
  | "WaitForTimePage";
/**
 *
 */
const check = ({
  xpath,
  badState,
}: {
  xpath: string;
  badState: StateOfInstagramPage;
}) =>
  pipe(
    $x(xpath),
    WT.map(A.isEmpty),
    WT.map((isEmpty) => ({
      isEmpty,
      badState,
    }))
  );
/**
 *
 */
const semigroupChainChecks: S.Semigroup<
  WT.WebProgram<{
    isEmpty: boolean;
    badState: StateOfInstagramPage;
  }>
> = {
  concat: (x, y) =>
    pipe(
      x,
      WT.chain(({ isEmpty, badState }) => (isEmpty ? y : x))
    ),
};
/**
 *
 */
const concatChecks = S.concatAll(semigroupChainChecks);
/**
 *
 */
const recursivelyTryGotoInstagramPage = (
  badCases: { xpath: string; badState: StateOfInstagramPage }[]
) => (n: number) => (): WT.WebProgram<StateOfInstagramPage> =>
  n > 0
    ? pipe(
        badCases.map((xpath) => check(xpath)),
        (checks) => concatChecks(checks[0])(checks.slice(1)),
        WT.chain(({ isEmpty, badState }) =>
          isEmpty === true
            ? pipe(
                undefined,
                WT.delay(500),
                WT.chain(() =>
                  recursivelyTryGotoInstagramPage(badCases)(n - 1)()
                )
              )
            : WT.of<StateOfInstagramPage>(badState)
        )
      )
    : WT.of<StateOfInstagramPage>("AvailablePage");
/**
 *
 */
export const goto: (
  lang: Languages
) => (url: string) => WT.WebProgram<StateOfInstagramPage> = (lang) => (url) =>
  pipe(
    gotoWD(url),
    WT.chain(
      recursivelyTryGotoInstagramPage(
        getPropertiesFromSettingsAndLanguage<
          { xpath: string; badState: StateOfInstagramPage }[],
          Settings
        >((sets) => [
          { xpath: sets.notAvailablePage.XPath, badState: "NotAvailablePage" },
          { xpath: sets.waitForTimePage.XPath, badState: "WaitForTimePage" },
        ])(settingsByLanguage)(lang)
      )(3)
    )
  );
