import { pipe } from 'fp-ts/function';
import { ElementHandle } from 'puppeteer';
import * as WT from 'WebTeer/index';
import { click, isOneElementArray, type } from 'WebTeer/Utils/ElementHandle';
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
export const sendMessage = (text: string) =>
  pipe(
    waitFor$x(`//div[@class='composer_rich_textarea']`),
    WT.chain(
      isOneElementArray(
        (els, r) => `Found '${els.length}' textarea-input(s) at ${r.page.url()}`
      )
    ),
    WT.chain((els) => WT.of(els[0])),
    WT.chainFirst(click),
    WT.chain(WT.delay(700)),
    WT.chain(type(text + String.fromCharCode(13), { delay: 300 }))
  );
