import { pipe } from 'fp-ts/function';
import { ElementHandle, Page } from 'puppeteer';
import * as WT from 'src/index';
import * as F from 'src/WebTeer/Applications/Instagram/Bots/Follow/index';
import * as L from 'src/WebTeer/Applications/Instagram/Bots/Like/index';
import * as WS from 'src/WebTeer/Applications/Instagram/Bots/WatchStory/index';
import { sendMessage } from 'src/WebTeer/Applications/Telegram/Utils';
import { MainResult } from 'src/WebTeer/Bot/main';
import { click } from 'src/WebTeer/Utils/ElementHandle';
import { goto } from 'src/WebTeer/Utils/Page';
import { openNewPage, otherPages } from 'src/WebTeer/Utils/WebDeps';

import { BotDeps } from '../..';
import { Action, Comment, Follow, Like, match as getMatch, Story } from '../../Action';
import { ActionInfo, ATE, getActionMessage } from './getInfos';

/**
 * to implement
 */

const comment = (c: Comment): WT.WebProgram<Comment> =>
  WT.of({ ...c, skip: true });
// implemented
/**
 * actions
 */
const followMatch = F.ByElement.match;
const onProfilePage = F.OnProfilePage.onProfilePage;
const follow = (f: Follow): WT.WebProgram<Follow> =>
  pipe(
    onProfilePage({
      allowFollowPrivate: false,
      expectedButtonText: f.expectedText,
    }),
    WT.chain((resExt) =>
      pipe(
        resExt.result,
        followMatch(
          (a) => WT.of<Follow>(f),
          (b) => WT.of<Follow>({ ...f, skip: true })
        )
      )
    )
  );
//---
const likeMatch = L.ByElement.match;
const onPostPage = L.OnPostPage.onPostPage;
const like = (l: Like): WT.WebProgram<Like> =>
  pipe(
    onPostPage({
      expectedLikeButtonSvgArialabel: l.expectedText,
    }),
    WT.chain((s) =>
      pipe(
        s.byElementResult,
        likeMatch(
          (a) => WT.of<Like>(l),
          (b) => WT.of<Like>({ ...l, skip: true })
        )
      )
    )
  );
//---
const storyMatch = WS.OpenedByUrl.match;
const openedByUrl = WS.OpenedByUrl.openedByUrl;
const allViewed = (ss: WS.OpenedByUrl.Result_StoryStats): boolean =>
  ss.availableStories >= ss.maxStories
    ? ss.maxStories === ss.viewedStories
    : ss.availableStories === ss.viewedStories;
const watchStory = (s: Story): WT.WebProgram<Story> =>
  pipe(
    openedByUrl({
      permissionButtonText: s.expectedText,
      maxStories: 10,
    }),
    WT.chain(
      storyMatch(
        (ss) =>
          allViewed(ss) ? WT.of<Story>(s) : WT.of<Story>({ ...s, skip: true }),
        (ss) => WT.of<Story>({ ...s, skip: true })
      )
    )
  );
/**
 * match
 */
const match = getMatch<WT.WebProgram<Action>>(
  follow,
  like,
  comment,
  watchStory
);
const triggerAction = (action: Action) => (page: Page) =>
  pipe(
    WT.ask(),
    WT.chainTaskEitherK((r) => pipe({ ...r, page: page }, match(action)))
  );
/**
 * endCycle
 * @description ends cycle and sets the telegram
 * chat ready for next cycle
 */
const prepareNextCycle: (m: BotDeps) => WT.WebProgram<MainResult> = (m) =>
  pipe(
    getActionMessage(m),
    WT.chainN<ATE>(
      500,
      3
    )((a) =>
      a.el !== undefined
        ? WT.of(a)
        : pipe(
            sendMessage(m.botChatButtons.newAction),
            WT.chain(WT.delay(500)),
            WT.chain(() => getActionMessage(m))
          )
    ),
    WT.chain((a) =>
      a.el !== undefined
        ? WT.of(undefined)
        : WT.left(
            new Error(
              `No action-message found for next cycle in chat with ${m.botChatName}`
            )
          )
    ),
    WT.chain(() => WT.of<MainResult>({ end: true }))
  );
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
          WT.chain(triggerAction(actionInfo.action)),
          WT.chain((actionAfterUse) =>
            actionAfterUse.skip
              ? click(actionInfo.skipBtn)
              : click(actionInfo.confirmBtn)
          )
        ),
    WT.chain(() => prepareNextCycle(actionInfo.botDeps))
  );
