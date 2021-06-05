import { pipe } from 'fp-ts/function';
import * as WT from 'WebTeer/index';
import { gotoHome, openDialog } from 'WT-Telegram/Utils';

const initDo: (botChatName: string) => WT.WebProgram<string> = (botChatName) =>
  pipe(
    gotoHome,
    WT.chain(() => openDialog(botChatName)),
    WT.chain(() => WT.of(botChatName))
  );

export { initDo };
