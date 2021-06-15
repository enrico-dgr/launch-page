import * as WT from 'src/index';
import { get, MainResult } from 'src/WebTeer/Bot/main';

import { BotDeps, emptyBotDeps } from '../';
import { mainDo } from './Do/index';

const main = get({
  checksBeforeDo: () => [WT.of(undefined)],
  do: mainDo,
  // () =>
  //   WT.of<BotDeps & MainResult>({
  //     ...emptyBotDeps,
  //     botChatName: "",
  //     end: true,
  //   }),
  checksAfterDo: () => [WT.of(undefined)],
});

export { main };
