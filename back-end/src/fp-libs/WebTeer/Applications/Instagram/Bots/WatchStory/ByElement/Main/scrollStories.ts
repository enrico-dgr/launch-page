import { pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import * as WT from 'WebTeer/index';
import { click, exists } from 'WebTeer/Utils/ElementHandle';

import { StoryStats, TransitionType } from '../index';

const cycles = (c: StoryStats): number => {
  const leftToView = c.availableStories - c.viewedStories;
  return leftToView < c.maxStories ? leftToView : c.maxStories;
};

type ViewedCounter = {
  now: number;
  before: number;
};
const toViewedCounter = (c: StoryStats): ViewedCounter => ({
  now: c.viewedStories,
  before: c.viewedStories - 1,
});
const incViewedCounter = (vc: ViewedCounter): ViewedCounter => ({
  now: vc.now + 1,
  before: vc.now,
});
const notChangedViewedCounter = (vc: ViewedCounter): ViewedCounter => ({
  ...vc,
  before: vc.now,
});
const isChangedViewedCounter = (vc: ViewedCounter): boolean =>
  vc.now === vc.before;

export const scrollStories: (
  nextStoryButton: ElementHandle<HTMLButtonElement>
) => (c: StoryStats) => WT.WebProgram<StoryStats> = (nextStoryButton) => (c) =>
  pipe(
    WT.of<ViewedCounter>(toViewedCounter(c)),
    WT.chainN<ViewedCounter>(
      100,
      cycles(c)
    )((vc) =>
      isChangedViewedCounter(vc)
        ? pipe(
            nextStoryButton,
            exists,
            WT.chain((stillExists) =>
              stillExists
                ? pipe(
                    nextStoryButton,
                    click,
                    WT.chain(() => WT.of(incViewedCounter(vc)))
                  )
                : WT.of(notChangedViewedCounter(vc))
            )
          )
        : WT.of(vc)
    ),
    WT.chain((vc) => WT.of<StoryStats>({ ...c, viewedStories: vc.now }))
  );
