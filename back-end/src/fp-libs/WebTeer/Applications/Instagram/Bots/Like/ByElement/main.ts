import { pipe } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';
import { click } from 'WebTeer/Utils/ElementHandle';

import { ByElementDeps } from './index';

export const main = (m: ByElementDeps): WT.WebProgram<ByElementDeps> =>
  pipe(
    m.el,
    click,
    WT.chain(() => WT.of(m))
  );
