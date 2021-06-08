/**
 *
 */
import { pipe } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';

import { byElement, noStoryStats, StoryStats } from '../ByElement';
import { matchTransitionType, Result_StoryStats, TransitionType } from './index';

export const main: (
  m: TransitionType
) => WT.WebProgram<Result_StoryStats> = matchTransitionType(
  (s) =>
    pipe(
      byElement({
        buttonNext: s.buttonNext,
        maxStories: s.maxStories,
      }),
      WT.chain((c) => WT.of<Result_StoryStats>({ ...c, tag_: "Viewed" }))
    ),
  (nS) =>
    WT.of<Result_StoryStats>({
      ...noStoryStats,
      tag_: "NotViewed",
      maxStories: nS.maxStories,
    })
);
