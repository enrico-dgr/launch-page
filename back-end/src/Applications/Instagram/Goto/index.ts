import * as A from 'fp-ts/Array';
import { flow, pipe } from 'fp-ts/function';
import * as WT from 'src/index';
import {
    getPropertiesFromSettingsAndLanguage, Languages, SettingsByLanguage
} from 'src/WebTeer/settingsByLanguage';
import { $x, goto as gotoWD } from 'src/WebTeer/Utils/WebDeps';

import { Settings, settingsByLanguage } from '../SettingsByLanguage';

export type StateOfInstagramPage = "AvailablePage" | "NotAvailablePage";

const tryNTimesGotoInstagramPage = (notAvailablePageXPath: string) => (
  n: number
) => (): WT.WebProgram<StateOfInstagramPage> =>
  n > 0
    ? pipe(
        $x(notAvailablePageXPath),
        WT.map(A.isEmpty),
        WT.chain((b) =>
          b === true
            ? pipe(
                undefined,
                WT.delay(500),
                WT.chain(() =>
                  tryNTimesGotoInstagramPage(notAvailablePageXPath)(n - 1)()
                )
              )
            : WT.of<StateOfInstagramPage>("NotAvailablePage")
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
      tryNTimesGotoInstagramPage(
        getPropertiesFromSettingsAndLanguage<string, Settings>(
          (sets) => sets.notAvailablePage.XPath
        )(settingsByLanguage)(lang)
      )(3)
    )
  );
