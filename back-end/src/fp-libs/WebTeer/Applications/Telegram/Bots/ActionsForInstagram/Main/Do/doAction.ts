import { pipe } from 'fp-ts/function';
import { MainResult } from 'WebTeer/Bot/main';
import * as WT from 'WebTeer/index';
import { goto } from 'WebTeer/Utils/Page';
import { openNewPage, otherPages } from 'WebTeer/Utils/WebDeps';
import * as IG from 'WT-Instagram/index';

import { Action, Comment, Follow, Like, match as getMatch, Story } from '../../actions';
import { ActionInfo } from './getInfos';

/**
 * declaration
 */
declare const skip: () => WT.WebProgram<MainResult>;
declare const confirm: () => WT.WebProgram<MainResult>;
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
    WT.of<MainResult>({ end: false })
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
  actionInfo.action.skip
    ? skip()
    : pipe(
        otherPages,
        WT.chain((pages) => (pages.length > 0 ? WT.of(pages[0]) : openNewPage)),
        WT.chainFirst(goto(actionInfo.href)),
        WT.chain((page) =>
          pipe(
            WT.ask(),
            WT.chainTaskEitherK((r) =>
              pipe({ ...r, page: page }, match(actionInfo.action))
            )
          )
        ),
        WT.chain((action) => (action.skip ? skip() : confirm())),
        WT.chain(endCycle)
      );
