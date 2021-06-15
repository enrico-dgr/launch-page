import { pipe } from 'fp-ts/lib/function';
import * as WT from 'src/index';
import { click, isOneElementArray, isZeroElementArray } from 'src/WebTeer/Utils/ElementHandle';
import { $x } from 'src/WebTeer/Utils/WebDeps';

import { Permission_MaxStories } from '../index';

/**
 * story button permission
 * `//section/div//button[contains(.,'Visualizza la storia')]`
 */
interface FromShowStories {
  button_ShowStory_Clicked: boolean;
}
const expect_buttonByText_ToBeOne = (text: string) =>
  pipe(
    $x(`//section/div//button[contains(.,'${text}')]`),
    WT.chain(
      isOneElementArray(
        (els, r) =>
          `Found '${els.length}' permission button(s). Info: \n` +
          JSON.stringify({
            expectedButtonText: text,
            url: r.page.url(),
          })
      )
    ),
    WT.chain((els) => WT.of(els[0]))
  );
const expect_buttonByText_NotToBeFound = (text: string) =>
  pipe(
    $x(`//section/div//button[contains(.,'${text}')]`),
    WT.chain(
      isZeroElementArray(
        (els, r) =>
          `Found '${els.length}' permission button(s). Info: \n` +
          JSON.stringify({
            expectedButtonText: text,
            url: r.page.url(),
          })
      )
    ),
    WT.chain((els) => WT.of(els[0]))
  );

export const showStories: (
  i: Permission_MaxStories
) => WT.WebProgram<FromShowStories> = (i) =>
  pipe(
    WT.of(undefined),
    WT.chainNOrElse<undefined, FromShowStories>(
      500,
      20
    )(() =>
      pipe(
        expect_buttonByText_ToBeOne(i.permissionButtonText),
        WT.chainFirst(click),
        WT.chain(() =>
          WT.of<FromShowStories>({ button_ShowStory_Clicked: true })
        )
      )
    ),
    WT.chainFirst(() =>
      expect_buttonByText_NotToBeFound(i.permissionButtonText)
    ),
    WT.orElse(() => WT.of<FromShowStories>({ button_ShowStory_Clicked: false }))
  );
