import { of, WebProgram } from 'WebTeer/index';

import { StoryStats } from './index';

export const conclusion: (c: StoryStats) => WebProgram<StoryStats> = (c) =>
  of(c);
