import { of, WebProgram } from 'src/index';

import { StoryStats } from './index';

export const conclusion: (c: StoryStats) => WebProgram<StoryStats> = (c) =>
  of(c);
