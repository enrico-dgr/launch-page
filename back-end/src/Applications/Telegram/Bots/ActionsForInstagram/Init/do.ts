import { pipe } from 'fp-ts/function';
import * as WT from 'src/index';
import { gotoHome, openDialog } from 'src/WebTeer/Applications/Telegram/Utils';

import { BotDeps } from '../';

const initDo: (bd: BotDeps) => WT.WebProgram<BotDeps> = (bd) =>
  pipe(
    gotoHome,
    WT.chain(() => openDialog(bd.botChatName)),
    WT.chain(() => WT.of(bd))
  );

export { initDo };
