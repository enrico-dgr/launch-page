import * as Bot from 'WebTeer/Bot';
import { WebProgram } from 'WebTeer/index';

import { clean } from './Clean';
import { init } from './Init';
import { main } from './Main';

interface tag {
  _tag: string;
}
interface Skip {
  skip: boolean;
}
interface ExpectedText {
  expectedText: string;
}
interface Follow extends tag, Skip, ExpectedText {
  _tag: "Follow";
}
interface Like extends tag, Skip, ExpectedText {
  _tag: "Like";
}
interface Comment extends tag, Skip, ExpectedText {
  _tag: "Comment";
}
interface Story extends tag, Skip, ExpectedText {
  _tag: "Story";
}
interface NoAct extends tag {
  _tag: "NoAct";
}
export type Action = Follow | Like | Comment | Story;
export interface BotDeps {
  botChatName: string;
  action: {
    follow: Follow;
    like: Like;
    comment: Comment;
    story: Story;
  };
}
export const emptyBotDeps: BotDeps = {
  botChatName: "",
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
  clean,
});
