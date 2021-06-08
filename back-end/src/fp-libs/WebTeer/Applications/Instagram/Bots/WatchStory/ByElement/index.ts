import { ElementHandle } from 'puppeteer';
import { get } from 'WebTeer/Bot';

import { conclusion } from './conclusion';
import { init } from './init';
import { main } from './Main';

/**
 * loading bars
 * `//header/div/div[./div[@style='width: 100%;']]`
 */
/**
 *
 */
export interface MaxStories {
  maxStories: number;
}
export interface ButtonNext {
  buttonNext: ElementHandle<HTMLButtonElement>;
}
export interface ButtonNext_MaxStories extends MaxStories, ButtonNext {
  buttonNext: ElementHandle<HTMLButtonElement>;
  maxStories: number;
}
export interface TransitionType extends ButtonNext {
  buttonNext: ElementHandle<HTMLButtonElement>;
  storyStats: StoryStats;
}

export interface StoryStats extends MaxStories {
  availableStories: number;
  viewedStories: number;
  maxStories: number;
}
export const noStoryStats: StoryStats = {
  availableStories: 0,
  viewedStories: 0,
  maxStories: 0,
};
export const byElement = get<
  ButtonNext_MaxStories,
  TransitionType,
  StoryStats,
  StoryStats
>({
  init: init,
  main: main,
  conclusion: conclusion,
});
