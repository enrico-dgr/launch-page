import { pipe } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';

import { byElement, liked } from '../ByElement';
import { ConclusionType, MiddleType } from './index';

export const main: (m: MiddleType) => WT.WebProgram<ConclusionType> = (m) =>
  pipe(
    m.alreadyLiked ? WT.of(liked) : byElement(m.byElementDeps),
    WT.chain((res) =>
      WT.of<ConclusionType>({
        byElementResult: res,
        alreadyLiked: m.alreadyLiked,
      })
    )
  );
