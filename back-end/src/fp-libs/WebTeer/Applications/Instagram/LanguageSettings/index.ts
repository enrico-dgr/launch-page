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
    buttonLike: {
      svg: {
        expectedProps: {
          preLike: [[["aria-label", "Mi piace"]]],
          postLike: [[["aria-label", "Non mi piace più"]]],
        },
      },
    },
    notAvailablePage: {
      XPath: `//*[contains(.,'Spiacenti, questa pagina non è disponibile')]`,
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
    igPostPage: {
      elements: {
        buttonLike: {
          XPath: `//section/span/button[./div/span/*[name()='svg' and @aria-label='Mi piace']]`,
        },
        buttonUnlike: {
          XPath: `//section/span/button[./div/span/*[name()='svg' and @aria-label='Non mi piace più']]`,
        },
      },
    },
  },
};
