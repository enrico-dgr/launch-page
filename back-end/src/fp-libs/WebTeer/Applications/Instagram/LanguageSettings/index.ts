import { LanguageSettings } from 'WebTeer/options';

import { Setting } from './setting';

export { Setting } from "./setting";

export const languageSettings: LanguageSettings<Setting> = {
  it: {
    buttonFollow: {
      expectedProps: {
        preFollow: [
          [["innerText", "Segui"]],
          [["innerText", "Segui anche tu"]],
        ],
        postFollow: [[["innerText", ""]]],
      },
    },
    profilePage: {
      elements: {
        privateProfile: {
          XPath: `//*[contains(text(),'Questo account è privato')]`,
        },
        buttonFollow: {
          XPath: `//header//*/button[contains(text(),'Segui')]`,
        },
      },
    },
  },
};
