import { pipe } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';
import { isOneElementArray } from 'WebTeer/Utils/ElementHandle';
import { waitFor$x } from 'WebTeer/Utils/WebDeps';

import { StoryStats, TransitionType } from '../index';
import { scrollStories } from './scrollStories';

export const main: (m: TransitionType) => WT.WebProgram<StoryStats> = ({
  storyStats,
  buttonNext,
}) => pipe(storyStats, scrollStories(buttonNext));
