import { flow, pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import * as WT from 'WebTeer/index';
import { $x, isOneElementArray, isZeroElementArray } from 'WebTeer/Utils/ElementHandle';

import { ByElementDeps, ByElementResult, liked, notLiked } from './index';

const expect_Like_BySvgArialabel_NotToBeFound = (arialabel: string) =>
  flow(
    $x(`.//*[name()='svg' and contains(@aria-label,'${arialabel}')]`),
    WT.chain(
      isZeroElementArray(
        (els, r) =>
          `Found ${els.length} svg(s) with expected text in like-button. Info:\n` +
          JSON.stringify({
            expectedLikeButtonSvgArialabel: arialabel,
            url: r.page.url(),
          })
      )
    )
  );
const expect_Unlike_BySvgArialabel_ToBeOne = (arialabel: string) =>
  flow(
    $x(`.//*[name()='svg' and contains(@aria-label,'${arialabel}')]`),
    WT.chainFirst(
      isOneElementArray(
        (els, r) =>
          `Found ${els.length} svg(s) with expected text in unlike-button. Info:\n` +
          JSON.stringify({
            expectedUnLikeButtonSvgArialabel: arialabel,
            url: r.page.url(),
          })
      )
    )
  );
export const conclusion = (c: ByElementDeps): WT.WebProgram<ByElementResult> =>
  pipe(
    WT.of(c.el),
    WT.chainNOrElse<ElementHandle<HTMLButtonElement>, void>(
      1000,
      10
    )((el) =>
      pipe(
        el,
        expect_Like_BySvgArialabel_NotToBeFound(
          c.expectedLikeButtonSvgArialabel
        ),
        WT.chain(() =>
          pipe(
            el,
            expect_Unlike_BySvgArialabel_ToBeOne(
              c.expectedUnLikeButtonSvgArialabel ?? ""
            )
          )
        ),
        WT.chain(() => WT.of(undefined))
      )
    ),
    WT.chain(() => WT.of<ByElementResult>(liked)),
    WT.orElse(() => WT.of<ByElementResult>(notLiked))
  );
