import { pipe } from 'fp-ts/function';
import * as WT from 'src/index';
import * as Telegram from 'src/WebTeer/Applications/Telegram/index';
import { isNElementArray } from 'src/WebTeer/Utils/ElementHandle';
import { waitFor$x } from 'src/WebTeer/Utils/WebDeps';

import { BotDeps } from '../';

const XPathAnyMessage = (botChatName: string) =>
  Telegram.XPaths.messageWithText(botChatName, "");
const checksAfterDo: (bd: BotDeps) => WT.WebProgram<void>[] = (bd) => [
  pipe(
    waitFor$x(XPathAnyMessage(bd.botChatName)),
    WT.chain(
      isNElementArray((n) => n > 0)(
        (els, r) =>
          `Found ${els.length} messages for bot-name: "${bd.botChatName}" \n` +
          `URL: ${r.page.url()}`
      )
    ),
    WT.chain(() => WT.of(undefined))
  ),
];

export { checksAfterDo };
