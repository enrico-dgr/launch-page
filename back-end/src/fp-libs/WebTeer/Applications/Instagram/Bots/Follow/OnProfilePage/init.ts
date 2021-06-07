import { pipe } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';
import * as WTUtils from 'WebTeer/Utils';

import { ByElementDeps_Extended, OnProfilePageDeps } from './index';

const waitFor$x = WTUtils.WebDepsUtils.waitFor$x;
const $x = WTUtils.WebDepsUtils.$x;
const isOneElementArray = WTUtils.ElementHandleUtils.isOneElementArray;
const isZeroElementArray = WTUtils.ElementHandleUtils.isZeroElementArray;

export const init = (
  i: OnProfilePageDeps
): WT.WebProgram<ByElementDeps_Extended> =>
  pipe(
    `//header//*/button[contains(text(),'${i.expectedButtonText}')]`,
    waitFor$x,
    WT.chain(
      isOneElementArray(
        (els, r) =>
          `Found "${
            els.length
          }" follow-button(s) on profile page ${r.page.url()}`
      )
    ),
    WT.chainFirst(WT.delay(3000)),
    WT.chain((els) =>
      pipe(
        $x(`//*[contains(.,'privat')]`),
        WT.chain((elsWithPrivate) => WT.of(elsWithPrivate.length > 0)),
        WT.chain((prvt) =>
          WT.of<ByElementDeps_Extended>({ ...i, el: els[0], private: prvt })
        )
      )
    )
  );
