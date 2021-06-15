import { pipe } from 'fp-ts/lib/function';

import * as WebDepsUtils from '../../../../dependencies';
import * as ElementUtils from '../../../../elementHandle';
import * as WebTeer from '../../../../index';
import * as PageXPaths from '../../deprecated4/profilePage';

export const postFollowChecks = [
  pipe(
    WebTeer.of(undefined),
    WebTeer.chainNOrElse<undefined, void>(
      2000,
      4
    )(() =>
      pipe(
        WebDepsUtils.$x(PageXPaths.followButton.clicked),
        WebTeer.chain(
          ElementUtils.isOneElementArray(
            (els, r) =>
              `Found "${els.length}" clickedFollow-buttons at ${r.page.url()}`
          )
        ),
        WebTeer.chain(() => WebTeer.of(undefined))
      )
    )
  ),
];
