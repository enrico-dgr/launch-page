import * as Bot from 'WebTeer/Bot';
import { WebProgram } from 'WebTeer/index';

import { Comment, Follow, Like, Story } from './actions';
import { conclusion } from './Conclusion';
import { init } from './Init';
import { main } from './Main';

export interface BotDeps {
  botChatName: string;
  botChatButtons: {
    confirm: string;
    skip: string;
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
export const ActionsForInstagram: (
  bd: BotDeps
) => WebProgram<undefined> = Bot.get({
  init,
  main,
  conclusion: conclusion,
});
