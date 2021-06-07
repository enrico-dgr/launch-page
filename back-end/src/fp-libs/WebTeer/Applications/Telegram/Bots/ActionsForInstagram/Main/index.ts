import { get, MainResult } from 'WebTeer/Bot/main';
import * as WT from 'WebTeer/index';

import { BotDeps, emptyBotDeps } from '../';

const main = get({
  checksBeforeDo: () => [WT.of(undefined)],
  do: () =>
    WT.of<BotDeps & MainResult>({
      ...emptyBotDeps,
      botChatName: "",
      end: true,
    }),
  checksAfterDo: () => [WT.of(undefined)],
});

export { main };
