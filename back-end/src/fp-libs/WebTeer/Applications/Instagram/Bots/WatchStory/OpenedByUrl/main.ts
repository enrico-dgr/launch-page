/**
 *
 */
import { pipe } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';

import { byElement, noStoryStats } from '../ByElement';
import { matchTransitionType, Result_StoryStats, TransitionType } from './index';

export const main: (m: TransitionType) => WT.WebProgram<Result_StoryStats> = (
  m
) =>
  pipe(
    m,
    matchTransitionType(
      (s) =>
        pipe(
          byElement({
            buttonNext: s.buttonNext,
            maxStories: s.maxStories,
          }),
          WT.chain((c) => WT.of<Result_StoryStats>({ ...c, _tag: "Viewed" }))
        ),
      (nS) =>
        WT.of<Result_StoryStats>({
          ...noStoryStats,
          _tag: "NotViewed",
          maxStories: nS.maxStories,
        })
    )
  );
