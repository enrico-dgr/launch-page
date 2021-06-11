import { LanguageSettings } from 'WebTeer/options';

import { Setting } from './setting';

export { Setting } from "./setting";

export const languageSettings: LanguageSettings<Setting> = {
  it: {
    buttonFollow: {
      expectedProps: {
        preFollow: [["innerText", "Segui"]],
        postFollow: [["innerText", ""]],
      },
    },
    profilePage: {
      elements: {
        privateProfile: {
          XPath: `//*[contains(.,'private')]`,
        },
        buttonFollow: {
          XPath: `//header//*/button[contains(text(),'Segui')]`,
        },
      },
    },
  },
};
