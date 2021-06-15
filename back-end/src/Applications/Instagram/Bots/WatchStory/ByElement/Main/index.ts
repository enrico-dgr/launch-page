import { pipe } from 'fp-ts/lib/function';
import * as WT from 'src/index';
import { isOneElementArray } from 'src/WebTeer/Utils/ElementHandle';
import { waitFor$x } from 'src/WebTeer/Utils/WebDeps';

import { StoryStats, TransitionType } from '../index';
import { scrollStories } from './scrollStories';

export const main: (m: TransitionType) => WT.WebProgram<StoryStats> = ({
  storyStats,
  buttonNext,
}) => pipe(storyStats, scrollStories(buttonNext));
