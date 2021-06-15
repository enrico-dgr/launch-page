import { pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import { checkHTMLProperties, click, HTMLElementProperties } from 'src/elementHandle';
import * as WT from 'src/index';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'src/settingsByLanguage';
import {
    Settings as SettingsOfInstagram, settingsByLanguage
} from 'WT-Instagram/SettingsByLanguage';

export interface Options {
  maxStories?: number;
}
interface Settings {
  expectedPropsOfButtonNext: HTMLElementProperties<HTMLButtonElement, string>;
}
interface InputOfBody {
  availableStories: number;
  viewedStories: number;
  buttonNext: ElementHandle<HTMLButtonElement>;
  settings: Settings;
  options: Options;
}

export interface Output {
  availableStories: number;
  viewedStories: number;
}

const bodyOfScrollStories = (I: InputOfBody): WT.WebProgram<Output> => {
  /**
   * @description Calculates the number of scroll to do.
   * @category Abstraction
   */
  const cycles = (): number => {
    const leftToView = I.availableStories - I.viewedStories;
    const limit = I.options.maxStories ?? leftToView;
    return leftToView < limit ? leftToView : limit;
  };
  /**
   * @category Abstraction
   */
  const incrementNumberOfWatchedStories = () =>
    pipe(I.viewedStories++, () => WT.of(undefined));
  /**
   * @category Abstraction
   */
  const recursivelyTryToScrollStory = (
    delayBetweenClicks: number,
    numberOfCycles: number
  ): WT.WebProgram<undefined> =>
    numberOfCycles > 0
      ? pipe(
          I.buttonNext,
          checkHTMLProperties(I.settings.expectedPropsOfButtonNext),
          WT.chain((stillExists) =>
            stillExists.length < 1
              ? pipe(
                  I.buttonNext,
                  click,
                  WT.chain(incrementNumberOfWatchedStories),
                  WT.chain(WT.delay(delayBetweenClicks)),
                  WT.chain(() =>
                    recursivelyTryToScrollStory(
                      delayBetweenClicks,
                      numberOfCycles - 1
                    )
                  )
                )
              : WT.of(undefined)
          )
        )
      : WT.of(undefined);

  return pipe(
    recursivelyTryToScrollStory(1000, cycles()),
    WT.chain(() =>
      WT.of({
        availableStories: I.availableStories,
        viewedStories: I.viewedStories,
      })
    )
  );
};

export interface Input {
  availableStories: number;
  viewedStories: number;
  buttonNext: ElementHandle<HTMLButtonElement>;
  language: Languages;
  options: Options;
}
const getSettings: (
  lang: Languages
) => Settings = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsOfInstagram
>((sets) => ({
  expectedPropsOfButtonNext:
    sets.pageOfStory.elements.buttonToScrollStory.expectedProps,
}))(settingsByLanguage);
export const scrollStories = (I: Input): WT.WebProgram<Output> =>
  bodyOfScrollStories({
    ...I,
    settings: getSettings(I.language),
  });
