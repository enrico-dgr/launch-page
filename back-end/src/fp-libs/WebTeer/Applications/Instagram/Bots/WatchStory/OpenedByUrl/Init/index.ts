import { pipe } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';
import { isOneElementArray } from 'WebTeer/Utils/ElementHandle';
import { $x } from 'WebTeer/Utils/WebDeps';

import { Permission_MaxStories, TransitionType } from '../index';
import { showStories } from './showStories';

/**
 * story button permission
 * `//section/div//button[contains(.,'Visualizza la storia')]`
 */

const $xOne_ButtonNextStory = pipe(
  $x(`//button[./div[@class='coreSpriteRightChevron']]`),
  WT.chain(
    isOneElementArray(
      (els, r) =>
        `Found '${els.length}' next-story-button(s). Info: \n` +
        JSON.stringify({
          url: r.page.url(),
        })
    )
  ),
  WT.chain((els) => WT.of(els[0]))
);

export const init: (
  i: Permission_MaxStories
) => WT.WebProgram<TransitionType> = (i) =>
  pipe(
    showStories(i),
    WT.chain(({ button_ShowStory_Clicked }) =>
      button_ShowStory_Clicked
        ? pipe(
            $xOne_ButtonNextStory,
            WT.chain((btn) =>
              WT.of<TransitionType>({
                tag_: "Shown",
                buttonNext: btn,
                maxStories: i.maxStories,
              })
            )
          )
        : WT.of<TransitionType>({ tag_: "NotShown", maxStories: i.maxStories })
    )
  );
