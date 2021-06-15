import * as WT from 'src/index';

import { ByElementResult_Extended } from './index';

export const conclusion = (
  c: ByElementResult_Extended
): WT.WebProgram<ByElementResult_Extended> => WT.of(c);
