import { pipe } from 'fp-ts/function';
import * as WT from 'WebTeer/index';
import { gotoHome, openDialog } from 'WT-Telegram/Utils';

import { BotDeps } from '../';

const initDo: (bd: BotDeps) => WT.WebProgram<BotDeps> = (bd) =>
  pipe(
    gotoHome,
    WT.chain(() => openDialog(bd.botChatName)),
    WT.chain(() => WT.of(bd))
  );

export { initDo };
