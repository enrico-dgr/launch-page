import { pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import * as WT from 'WebTeer/index';
import { getProperty } from 'WebTeer/Utils/ElementHandle';

export type ExpectedStringProperties = {
  preClick: [keyof HTMLButtonElement, string][];
  postClick: [keyof HTMLButtonElement, string][];
};
enum LanguageSettingsKeys {
  it = "it",
}
export const languageSettings: {
  [key in LanguageSettingsKeys]: ExpectedStringProperties;
} = {
  it: {
    preClick: [["innerText", "Segui"]],
    postClick: [["innerText", ""]],
  },
};
export interface ClickFollowButtonEntry {
  button: ElementHandle<HTMLButtonElement>;
  expectedStringProperties: ExpectedStringProperties;
  options: {
    /**
     * on *true* allows private profiles to be followed
     */
    allowFollowPrivate: boolean;
  };
}

export const init = (
  i: ClickFollowButtonEntry
): WT.WebProgram<ClickFollowButtonEntry> =>
  pipe(
    i.button,
    getProperty<string, HTMLButtonElement>(),
    // (
    //   i.expectedStringProperties.preClick[0],
    //   (el, r) => `Follow button doesn't contain text ${i.expectedButtonText}`
    // )
    WT.chain(() => WT.of(i))
  );
