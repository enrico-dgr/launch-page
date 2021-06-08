import { pipe } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';
import { waitFor$x } from 'WebTeer/Utils/WebDeps';

import { ButtonNext_MaxStories, TransitionType } from './index';

const numberOfElements = (XPath: string) =>
  pipe(
    waitFor$x(XPath),
    WT.chain((els) => WT.of(els.length))
  );
const availableStories = numberOfElements(`//div[@class='_7zQEa']`);
const viewedStories = numberOfElements(
  `//div[@class='XcATa ' and @style='width: 100%;']`
);

export const init: (
  i: ButtonNext_MaxStories
) => WT.WebProgram<TransitionType> = (i) =>
  pipe(
    availableStories,
    WT.chain((aS) =>
      pipe(
        viewedStories,
        WT.chain((vS) =>
          WT.of<TransitionType>({
            buttonNext: i.buttonNext,
            storyStats: {
              availableStories: aS,
              viewedStories: vS,
              maxStories: i.maxStories,
            },
          })
        )
      )
    )
  );
