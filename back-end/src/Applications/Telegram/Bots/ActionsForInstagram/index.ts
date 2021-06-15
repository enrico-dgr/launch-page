import { WebProgram } from 'src/index';
import * as Bot from 'src/WebTeer/Bot';

import { Comment, Follow, Like, Story } from './Action';
import { conclusion } from './Conclusion';
import { init } from './Init';
import { main } from './Main';

export interface BotDeps {
  botChatName: string;
  botChatButtons: {
    confirm: string;
    skip: string;
    newAction: string;
  };
  action: {
    follow: Follow;
    like: Like;
    comment: Comment;
    story: Story;
  };
}
export const emptyBotDeps: BotDeps = {
  botChatName: "",
  botChatButtons: {
    confirm: "",
    skip: "",
    newAction: "",
  },

  action: {
    follow: {
      _tag: "Follow",
      skip: true,
      expectedText: "",
    },
    like: {
      _tag: "Like",
      skip: true,
      expectedText: "",
    },
    comment: {
      _tag: "Comment",
      skip: true,
      expectedText: "",
    },
    story: {
      _tag: "Story",
      skip: true,
      expectedText: "",
    },
  },
};
export const actionsForInstagram: (
  bd: BotDeps
) => WebProgram<undefined> = Bot.get({
  init,
  main,
  conclusion: conclusion,
});
