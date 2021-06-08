import { of, WebProgram } from 'WebTeer/index';

import { Result_StoryStats } from './index';

export const conclusion: (
  c: Result_StoryStats
) => WebProgram<Result_StoryStats> = (c) => of(c);
