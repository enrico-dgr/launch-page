import { pipe } from 'fp-ts/lib/function';
import * as WT from 'src/index';

import { byElement, notFollowed } from '../ByElement';
import { ByElementDeps_Extended, ByElementResult_Extended } from './index';

export const main: (
  m: ByElementDeps_Extended
) => WT.WebProgram<ByElementResult_Extended> = (m) =>
  m.allowFollowPrivate === false && m.private === true
    ? WT.of<ByElementResult_Extended>({ result: notFollowed, private: true })
    : pipe(
        m,
        byElement,
        WT.chain((c) =>
          WT.of<ByElementResult_Extended>({ result: c, private: m.private })
        )
      );
