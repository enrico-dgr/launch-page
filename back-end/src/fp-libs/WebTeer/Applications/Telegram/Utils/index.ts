import { pipe } from 'fp-ts/function';
import { ElementHandle } from 'puppeteer';
import * as WT from 'WebTeer/index';
import { click, isOneElementArray } from 'WebTeer/Utils/ElementHandle';
import { goto, waitFor$x } from 'WebTeer/Utils/WebDeps';
import * as Telegram from 'WT-Telegram/index';

const HOME_HREF = Telegram.Urls.base.home.href;

export const gotoHome = goto(HOME_HREF);

export const openDialog: (chatName: string) => WT.WebProgram<void> = (
  botChatName
) =>
  pipe(
    waitFor$x(Telegram.XPaths.dialogLink(botChatName)),
    WT.chain(
      pipe(
        (els, r) =>
          `Found ${els.length} dialogs for bot-name: "${botChatName}" \n` +
          `URL: ${r.page.url()}`,
        isOneElementArray
      )
    ),
    WT.chain((els) => click(els[0]))
  );
