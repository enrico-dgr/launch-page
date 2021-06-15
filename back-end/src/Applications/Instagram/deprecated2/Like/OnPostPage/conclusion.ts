import * as WT from 'src/index';

import { ConclusionType } from './index';

export const conclusion = (c: ConclusionType): WT.WebProgram<ConclusionType> =>
  WT.of(c);
