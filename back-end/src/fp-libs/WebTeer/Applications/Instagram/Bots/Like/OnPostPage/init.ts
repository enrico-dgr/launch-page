import { flow, pipe } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';
import * as WTUtils from 'WebTeer/Utils';

import { MiddleType, OnPostPageDeps } from './index';

const $x = WTUtils.WebDepsUtils.$x;
const isOneElementArray = WTUtils.ElementHandleUtils.isOneElementArray;

const XPathByArialabel = (arialabel: string) =>
  `//section/span/button[./div/span/*[name()='svg' and contains(@aria-label,'${arialabel}')]]`;

const $xOne_Like_BySvgArialabel = (arialabel: string) =>
  pipe(
    XPathByArialabel(arialabel),
    $x,
    WT.chain(
      isOneElementArray(
        (els, r) =>
          `Found "${els.length}" like-button(s) with expected text in svg. Info: \n` +
          JSON.stringify({
            expectedLikeButtonSvgArialabel: arialabel,
            page: r.page.url(),
          })
      )
    )
  );
const $xOne_UnLike_BySvgArialabel = (arialabel: string) =>
  pipe(
    XPathByArialabel(arialabel),
    $x,
    WT.chain(
      isOneElementArray(
        (els, r) =>
          `Found "${els.length}" unlike-button(s) with expected text in svg. Info: \n` +
          JSON.stringify({
            expectedLikeButtonSvgArialabel: arialabel,
            page: r.page.url(),
          })
      )
    )
  );

export const init = (i: OnPostPageDeps): WT.WebProgram<MiddleType> =>
  pipe(
    WT.of(undefined),
    WT.chainNOrElse<undefined, MiddleType>(
      500,
      20
    )(() =>
      pipe(
        $xOne_Like_BySvgArialabel(i.expectedLikeButtonSvgArialabel),
        WT.chain((els) =>
          WT.of<MiddleType>({
            byElementDeps: { ...i, el: els[0] },
            alreadyLiked: false,
          })
        )
      )
    ),
    WT.orElse(
      flow(
        WT.delay(1000),
        WT.chain(() =>
          $xOne_UnLike_BySvgArialabel(i.expectedUnLikeButtonSvgArialabel ?? "")
        ),
        WT.chain((els) =>
          WT.of<MiddleType>({
            byElementDeps: { ...i, el: els[0] },
            alreadyLiked: true,
          })
        )
      )
    )
  );
