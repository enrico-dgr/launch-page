import { SettingsByLanguage } from 'src/WebTeer/settingsByLanguage';

import { Settings } from './settings';

export { Settings } from "./settings";

export const settingsByLanguage: SettingsByLanguage<Settings> = {
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
        XPath: `./div/span/*[name()='svg']`,
        XPathPreLike: `./div/span/*[name()='svg' and @aria-label='Mi piace']`,
        XPathPostLike: `./div/span/*[name()='svg' and @aria-label='Non mi piace più']`,
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
        buttonAlreadyFollow: {
          XPath: `//button[./div/span[@aria-label='Segui già']]`,
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
