import { pipe } from 'fp-ts/function';
import { ElementHandle } from 'puppeteer';
import { MainResult } from 'WebTeer/Bot/main';
import * as WT from 'WebTeer/index';
import { getHref, isOneElementArray } from 'WebTeer/Utils/ElementHandle';
import { waitFor$x } from 'WebTeer/Utils/WebDeps';
import * as Telegram from 'WT-Telegram/index';

import { Action, BotDeps } from '../..';

type ActionTuple = [string, Action];
interface ATE {
  ats: ActionTuple[];
  el?: ElementHandle<Element>;
}
type AHref = {
  action: Action;
  href: string;
};
/**
 *
 */
const getMessages: (
  botChatName: string
) => (text: string) => WT.WebProgram<ElementHandle<Element>[]> = (
  botChatName
) => (text) => waitFor$x(Telegram.XPaths.messageWithText(botChatName, text));
/**
 *
 */

/**
 *
 */
const getInfos: (m: BotDeps) => WT.WebProgram<AHref> = (m) =>
  pipe(
    /**
     * get action from messages
     */
    WT.of<ATE>({ ats: Object.entries<Action>(m.action), el: undefined }),
    WT.chainN<ATE>(
      100,
      10
    )(({ ats, el }) =>
      el !== undefined
        ? WT.of({ ats, el })
        : pipe(
            ats[0][1].expectedText,
            getMessages(m.botChatName),
            WT.chain(
              isOneElementArray((els_, r_) => `empty not printable error`)
            ),
            WT.chain((els) => WT.of({ ats, el: els[0] })),
            WT.orElse((e) => WT.of({ ats: ats.slice(1) }))
          )
    ),
    /**
     * parse to info type
     */
    WT.chain(({ ats, el }) =>
      el === undefined
        ? WT.left(
            new Error(
              `Impossible situation, element undefined at ${JSON.stringify(
                ats[0][1]
              )}`
            )
          )
        : pipe(
            getHref(el),
            WT.chain((href) => WT.of({ action: ats[0][1], href }))
          )
    )
  );
