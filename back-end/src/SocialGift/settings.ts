import { SettingsByBotChoice } from './settingsByBotChoice';
import { Settings } from './settingsType';

export { Settings } from "./settingsType";

export const settingsByBotChoice: SettingsByBotChoice<Settings> = {
  Socialgift: {
    message: {
      returnXPath: (interlocutor: string, mustContainText?: string) =>
        `//div[@class='im_content_message_wrap im_message_in'` +
        ` and contains(., '${interlocutor}')` +
        ` and contains(.,'${mustContainText}')]`,
      elements: {
        link: {
          relativeXPath: `//div[@class='im_message_text']//a[contains(@href,'http')]`,
        },
        buttonConfirm: {
          relativeXPath: `//button[contains(text(),'CONFERMA')]`,
        },
        buttonSkip: {
          relativeXPath: `//button[contains(text(),'SALTA')]`,
        },
      },
      expectedTextsForActions: {
        Follow: [["innerText", "Segui il Profilo"]],
        Like: [["innerText", "Lascia un LIKE"]],
        WatchStory: [["innerText", "Visualizza Stories"]],
        Comment: [["innerText", "Comment"]],
        Extra: [["innerText", "EXTRA"]],
      },
    },
    dialog: {
      elements: {
        buttonNewAction: {
          text: "🤑 GUADAGNA 🤑",
        },
      },
    },
  },
};
