import { pipe } from 'fp-ts/lib/function';

import * as WebDepsUtils from '../../../../dependencies';
import * as ElementUtils from '../../../../elementHandle';
import * as WebTeer from '../../../../index';

export const preFollowChecks = [
  pipe(
    WebDepsUtils.$x(`//*[contains(.,'privato')]`),
    WebTeer.chain(
      ElementUtils.isZeroElementArray(
        (els, r) =>
          `Found "${
            els.length
          }" element(s) with XPath '//*[contains(.,'privato')]' at ${r.page.url()}`
      )
    ),
    WebTeer.chain(() => WebTeer.of(undefined))
  ),
];
