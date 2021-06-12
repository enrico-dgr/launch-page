import * as A from 'fp-ts/Array';
import { flow, pipe } from 'fp-ts/function';
import * as WT from 'WebTeer/index';
import { LanguageSettings, LanguageSettingsKeys, languageSettingsSelector } from 'WebTeer/options';
import { $x, goto as gotoWD } from 'WebTeer/Utils/WebDeps';

import { languageSettings, Setting } from '../LanguageSettings';

export type PageState_Instagram = "AvailablePage" | "NotAvailablePage";

const gotoBody = (notAvailablePageXPath: string) => (n: number) => (
  url: string
): WT.WebProgram<PageState_Instagram> =>
  n > 0
    ? pipe(
        gotoWD(url),
        WT.chain(() =>
          pipe(
            $x(notAvailablePageXPath),
            WT.map(A.isEmpty),
            WT.chain((b) =>
              b === true
                ? pipe(
                    undefined,
                    WT.delay(500),
                    WT.chain(() => gotoBody(notAvailablePageXPath)(n - 1)(url))
                  )
                : WT.of<PageState_Instagram>("NotAvailablePage")
            )
          )
        )
      )
    : WT.of<PageState_Instagram>("AvailablePage");
/**
 *
 */
export const goto: (
  lang: LanguageSettingsKeys
) => (url: string) => WT.WebProgram<PageState_Instagram> = (lang) =>
  gotoBody(
    languageSettingsSelector<string, Setting>(
      (sets) => sets.notAvailablePage.XPath
    )(languageSettings)(lang)
  )(3);
