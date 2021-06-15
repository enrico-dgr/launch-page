import { pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import * as WT from 'src/index';
import { innerTextMatcher } from 'src/WebTeer/Utils/ElementHandle';

import { ByElementDeps, ByElementResult, followed, notFollowed } from './index';

export const conclusion = (c: ByElementDeps): WT.WebProgram<ByElementResult> =>
  pipe(
    WT.of(c.el),
    WT.chainNOrElse<
      ElementHandle<HTMLButtonElement>,
      ElementHandle<HTMLButtonElement>
    >(
      1000,
      10
    )(
      innerTextMatcher(false)(
        c.expectedButtonText,
        (el, r) =>
          `Follow button contains text ${c.expectedButtonText} after ByElement/main.`
      )
    ),
    WT.chain(() => WT.of<ByElementResult>(followed)),
    WT.orElse(() => WT.of<ByElementResult>(notFollowed))
  );
