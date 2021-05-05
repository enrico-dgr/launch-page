import { InitParams } from "../Types";

/**
 *
 * @param userName
 * @returns configs for socialgift
 * and loads ../userDataDir/**userName**
 */
export const scConfig = (
  userName: string,
  headless: boolean = true
): InitParams => {
  return {
    browserOpts: {
      userDataDir: `../userDataDir/${userName}`,
      headless: headless,
    },
    botName: "Socialgift",
    campaignInfo: {
      text: ["Partecipa alla Campagna"],
      button: {
        link: "PARTECIPA",
        bottom: "🤑 GUADAGNA 🤑",
        confirm: "CONFERMA",
        skip: "SALTA",
      },
      like: "Lascia un LIKE",
      follow: " Segui il Profilo",
      comment: {},
      story: "Visualizza Stories",
    },
  };
};
