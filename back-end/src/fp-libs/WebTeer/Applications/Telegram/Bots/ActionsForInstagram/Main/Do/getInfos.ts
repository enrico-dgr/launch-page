import { pipe } from 'fp-ts/function';
import { ElementHandle } from 'puppeteer';
import { MainResult } from 'WebTeer/Bot/main';
import * as WT from 'WebTeer/index';
import { $x, getHref, isOneElementArray } from 'WebTeer/Utils/ElementHandle';
import { waitFor$x } from 'WebTeer/Utils/WebDeps';
import * as Telegram from 'WT-Telegram/index';

import { BotDeps } from '../..';
import { Action } from '../../Action';

type ActionTuple = [string, Action];
interface ATE {
  ats: ActionTuple[];
  el?: ElementHandle<Element>;
}
export type ActionInfo = {
  action: Action;
  href: string;
  skipBtn: ElementHandle<Element>;
  confirmBtn: ElementHandle<Element>;
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
const getActionHref: (
  el: ElementHandle<Element>,
  m: BotDeps
) => WT.WebProgram<string> = (el, m) =>
  pipe(
    $x(`//div[@class='im_message_text']//a[contains(@href,'http')]`)(el),
    WT.chain(
      isOneElementArray(
        (els, r) =>
          `Found ${els.length} HTMLAnchorElement(s) containing 'http'. Info:\n` +
          JSON.stringify({ bot: m.botChatName, url: r.page.url() })
      )
    ),
    WT.chain((els) => getHref(els[0]))
  );
const getSkipButton: (
  el: ElementHandle<Element>,
  m: BotDeps
) => WT.WebProgram<ElementHandle<Element>> = (el, m) =>
  pipe(
    $x(`//button[contains(text(),'${m.botChatButtons.skip}')]`)(el),
    WT.chain(
      isOneElementArray(
        (els, r) =>
          `Found ${els.length} HTMLButtonElement(s) containing '${m.botChatButtons.skip}'. Info:\n` +
          JSON.stringify({ bot: m.botChatName, url: r.page.url() })
      )
    ),
    WT.chain((els) => WT.of(els[0]))
  );
const getConfirmButton: (
  el: ElementHandle<Element>,
  m: BotDeps
) => WT.WebProgram<ElementHandle<Element>> = (el, m) =>
  pipe(
    $x(`//button[contains(text(),'${m.botChatButtons.confirm}')]`)(el),
    WT.chain(
      isOneElementArray(
        (els, r) =>
          `Found ${els.length} HTMLButtonElement(s) containing '${m.botChatButtons.confirm}'. Info:\n` +
          JSON.stringify({ bot: m.botChatName, url: r.page.url() })
      )
    ),
    WT.chain((els) => WT.of(els[0]))
  );
/**
 *
 */
export const getInfos: (m: BotDeps) => WT.WebProgram<ActionInfo> = (m) =>
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
              `Impossible situation type due to recursive function type, element undefined at ${JSON.stringify(
                ats[0][1]
              )}`
            )
          )
        : pipe(
            getActionHref(el, m),
            WT.chain((url) => WT.of({ href: url })),
            WT.chainAdd(() =>
              pipe(
                getSkipButton(el, m),
                WT.chain((el) => WT.of({ skipBtn: el }))
              )
            ),
            WT.chainAdd(() =>
              pipe(
                getConfirmButton(el, m),
                WT.chain((el) => WT.of({ confirmBtn: el }))
              )
            ),
            WT.chain((s) => WT.of<ActionInfo>({ action: ats[0][1], ...s }))
          )
    )
  );
