import { pipe } from 'fp-ts/function';
import { ElementHandle } from 'puppeteer';
import { MainResult } from 'WebTeer/Bot/main';
import * as WT from 'WebTeer/index';
import { click } from 'WebTeer/Utils/ElementHandle';
import { goto } from 'WebTeer/Utils/Page';
import { openNewPage, otherPages } from 'WebTeer/Utils/WebDeps';
import * as IG from 'WT-Instagram/index';

import { Action, Comment, Follow, Like, match as getMatch, Story } from '../../actions';
import { ActionInfo } from './getInfos';

/**
 * declaration
 */
declare const follow: () => WT.WebProgram<Action>;
declare const like: () => WT.WebProgram<Action>;
declare const comment: () => WT.WebProgram<Action>;
declare const story: () => WT.WebProgram<Action>;

/**
 * endCycle
 * @description ends cycle and sets the telegram
 * chat ready for next cycle
 */
const endCycle: () => WT.WebProgram<MainResult> = () =>
  pipe(
    WT.of<MainResult>({ end: true })
  );
/**
 * match
 */
const match = getMatch(follow, like, comment, story);

/**
 *
 */
export const doAction: (actionInfo: ActionInfo) => WT.WebProgram<MainResult> = (
  actionInfo
) =>
  pipe(
    actionInfo.action.skip
      ? click(actionInfo.skipBtn)
      : pipe(
          otherPages,
          WT.chain((pages) =>
            pages.length > 0 ? WT.of(pages[0]) : openNewPage
          ),
          WT.chainFirst(goto(actionInfo.href)),
          WT.chain((page) =>
            pipe(
              WT.ask(),
              WT.chainTaskEitherK((r) =>
                pipe({ ...r, page: page }, match(actionInfo.action))
              )
            )
          ),
          WT.chain((actionAfterUse) =>
            actionAfterUse.skip
              ? click(actionInfo.skipBtn)
              : click(actionInfo.confirmBtn)
          )
        ),
    WT.chain(endCycle)
  );
