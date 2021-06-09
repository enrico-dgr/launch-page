import { pipe } from 'fp-ts/function';
import * as WT from 'WebTeer/index';
import { isNElementArray } from 'WebTeer/Utils/ElementHandle';
import { waitFor$x } from 'WebTeer/Utils/WebDeps';
import * as Telegram from 'WT-Telegram/index';

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
