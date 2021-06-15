import { flow, pipe } from 'fp-ts/lib/function';
import * as WT from 'src/index';
import { $x, isOneElementArray } from 'src/WebTeer/Utils/ElementHandle';

import { ByElementDeps } from './index';

const expect_Like_BySvgArialabel_ToBeOne = (arialabel: string) =>
  flow(
    $x(`.//*[name()='svg' and contains(@aria-label,'${arialabel}')]`),
    WT.chainFirst(
      isOneElementArray(
        (els, r) =>
          `Found ${els.length} svg(s) with expected text in like-button. Info:\n` +
          JSON.stringify({
            expectedLikeButtonSvgArialabel: arialabel,
            url: r.page.url(),
          })
      )
    )
  );

export const init = (i: ByElementDeps): WT.WebProgram<ByElementDeps> =>
  pipe(
    i.el,
    expect_Like_BySvgArialabel_ToBeOne(i.expectedLikeButtonSvgArialabel),
    WT.chain(() => WT.of<ByElementDeps>(i))
  );
