import { pipe } from 'fp-ts/lib/function';
import * as WT from 'src/index';
import { isOneElementArray } from 'src/WebTeer/Utils/ElementHandle';
import { waitFor$x } from 'src/WebTeer/Utils/WebDeps';

import { Permission_MaxStories, TransitionType } from '../index';
import { showStories } from './showStories';

const $xOne_ButtonNextStory = pipe(
  waitFor$x(`//button[./div[@class='coreSpriteRightChevron']]`),
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
                _tag: "Shown",
                buttonNext: btn,
                maxStories: i.maxStories,
              })
            )
          )
        : WT.of<TransitionType>({ _tag: "NotShown", maxStories: i.maxStories })
    )
  );
