import { pipe } from 'fp-ts/function';
import * as WT from 'WebTeer/index';
import { isNElementArray } from 'WebTeer/Utils/ElementHandle';
import { waitFor$x } from 'WebTeer/Utils/WebDeps';
import * as Telegram from 'WT-Telegram/index';

const XPathAnyMessage = (botChatName: string) =>
  Telegram.XPaths.messageWithText(botChatName, "");
const checksAfterDo: (botChatName: string) => WT.WebProgram<void>[] = (
  botChatName
) => [
  pipe(
    waitFor$x(XPathAnyMessage(botChatName)),
    WT.chain(
      pipe(
        (els, r) =>
          `Found ${els.length} messages for bot-name: "${botChatName}" \n` +
          `URL: ${r.page.url()}`,
        isNElementArray((n) => n > 0)
      )
    ),
    WT.chain(() => WT.of(undefined))
  ),
];

export { checksAfterDo };
