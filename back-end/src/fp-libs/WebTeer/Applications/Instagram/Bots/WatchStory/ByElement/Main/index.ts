import { pipe } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';

import { StoryStats, TransitionType } from '../index';
import { scrollStories } from './scrollStories';

export const main: (m: TransitionType) => WT.WebProgram<StoryStats> = ({
  storyStats: conclusion,
  buttonNext: nextStoryButton,
}) => pipe(conclusion, scrollStories(nextStoryButton));
