import { pipe } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';
import { innerTextMatcher } from 'WebTeer/Utils/ElementHandle';

import { ByElementDeps } from './index';

export const init = (i: ByElementDeps): WT.WebProgram<ByElementDeps> =>
  pipe(
    i.el,
    innerTextMatcher(true)(
      i.expectedButtonText,
      (el, r) => `Follow button doesn't contain text ${i.expectedButtonText}`
    ),
    WT.chain(() => WT.of(i))
  );
