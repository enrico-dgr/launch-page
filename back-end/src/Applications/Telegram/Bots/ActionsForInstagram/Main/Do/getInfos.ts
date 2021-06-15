import { pipe } from 'fp-ts/function';
import { ElementHandle } from 'puppeteer';
import * as WT from 'src/index';
import * as Telegram from 'src/WebTeer/Applications/Telegram/index';
import { MainResult } from 'src/WebTeer/Bot/main';
import { $x as element$x, getHref, isOneElementArray } from 'src/WebTeer/Utils/ElementHandle';
import { $x as webDeps$x } from 'src/WebTeer/Utils/WebDeps';

import { BotDeps } from '../..';
import { Action } from '../../Action';

type ActionTuple = [string, Action];
export interface ATE {
  ats: ActionTuple[];
  el?: ElementHandle<Element>;
}
/**
 *
 */
const getMessages: (
  botChatName: string
) => (text: string) => WT.WebProgram<ElementHandle<Element>[]> = (
  botChatName
) => (text) => webDeps$x(Telegram.XPaths.messageWithText(botChatName, text));
/**
 *
 */
export const getActionMessage: (m: BotDeps) => WT.WebProgram<ATE> = (m) =>
  pipe(
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
    )
  );
/**
 *
 */
export type ActionInfo = {
  botDeps: BotDeps;
  action: Action;
  href: string;
  skipBtn: ElementHandle<Element>;
  confirmBtn: ElementHandle<Element>;
};

/**
 *
 */
const getActionHref: (
  el: ElementHandle<Element>,
  m: BotDeps
) => WT.WebProgram<string> = (el, m) =>
  pipe(
    element$x(`//div[@class='im_message_text']//a[contains(@href,'http')]`)(el),
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
    element$x(`//button[contains(text(),'${m.botChatButtons.skip}')]`)(el),
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
    element$x(`//button[contains(text(),'${m.botChatButtons.confirm}')]`)(el),
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
 * Ate to ActionInfo parser
 */
const parseATE_To_ActionInfo: (
  m: BotDeps
) => (a: ATE) => WT.WebProgram<ActionInfo> = (m) => ({ ats, el }) =>
  el === undefined
    ? WT.left(
        new Error(`No action-message found in chat with ${m.botChatName}`)
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
        WT.chain((s) =>
          WT.of<ActionInfo>({ ...s, action: ats[0][1], botDeps: m })
        )
      );
/**
 *
 */
export const getInfos: (m: BotDeps) => WT.WebProgram<ActionInfo> = (m) =>
  pipe(getActionMessage(m), WT.chain(parseATE_To_ActionInfo(m)));
