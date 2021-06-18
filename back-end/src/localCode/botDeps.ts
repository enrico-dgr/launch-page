import { BotDeps } from 'src/Applications/Telegram/Bots/ActionsForInstagram';

export const socialgift: BotDeps = {
  botChatName: "Socialgift",
  botChatButtons: {
    newAction: "🤑 GUADAGNA 🤑",
    skip: "SALTA",
    confirm: "CONFERMA",
  },
  action: {
    follow: {
      _tag: "Follow",
      skip: false,
      expectedText: "Segui il Profilo",
    },
    like: {
      _tag: "Like",
      skip: false,
      expectedText: "Lascia un LIKE",
    },
    comment: {
      _tag: "Comment",
      skip: true,
      expectedText: "",
    },
    story: {
      _tag: "Story",
      skip: false,
      expectedText: "Visualizza Stories",
    },
  },
};
