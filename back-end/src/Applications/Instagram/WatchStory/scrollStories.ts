import { pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import { checkHTMLProperties, click, HTMLElementProperties } from 'src/elementHandle';
import * as WT from 'src/index';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'src/settingsByLanguage';
import { $x } from 'WebTeer/dependencies';
import {
    Settings as SettingsOfInstagram, settingsByLanguage
} from 'WT-Instagram/SettingsByLanguage';

export interface Options {
  maxStories?: number;
}
interface Settings {
  expectedPropsOfButtonNext: HTMLElementProperties<HTMLButtonElement, string>;
  xpathOfBarsForStories: string;
  xpathOfBarsForLoadingStories: string;
}
interface InputOfBody {
  buttonNext: ElementHandle<HTMLButtonElement>;
  settings: Settings;
  options: Options;
}
/**
 * @category Output
 * @subcategory Subtype
 */
export interface tag {
  _tag: string;
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface InfoOfStories {
  availableStories: number;
  viewedStories: number;
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface DerivatedInfos {
  limit: number;
  maxStories: number | "NotSpecified";
}
/**
 * @description
 * `availableStories > 0` &&
 * `limit === viewedStories`
 * @category Output
 * @subcategory Subtype
 */
interface AllWatched extends tag, InfoOfStories, DerivatedInfos {
  _tag: "AllWatched";
}
/**
 * @description
 * `availableStories > 0` &&
 * `viewedStories < limit` &&
 * `viewedStories > 0`
 * @category Output
 * @subcategory Subtype
 */
interface SomeWatched extends tag, InfoOfStories, DerivatedInfos {
  _tag: "SomeWatched";
}
/**
 * @description
 * `availableStories > 0` &&
 * `viewedStories === 0`
 * @category Output
 * @subcategory Subtype
 */
interface NotWatched extends tag, InfoOfStories, DerivatedInfos {
  _tag: "NotWatched";
}
/**
 * @description
 * `availableStories < -1`
 * @category Output
 * @subcategory Subtype
 */
interface NoAvailableStories extends tag {
  _tag: "NoAvailableStories";
}
/**
 * @description
 * Not handled situation
 * @category Output
 * @subcategory Subtype
 */
interface NotHandledSituation extends tag, InfoOfStories, DerivatedInfos {
  _tag: "NotHandledSituation";
}
/**
 * @category Output
 */
export type Output =
  | AllWatched
  | SomeWatched
  | NotWatched
  | NoAvailableStories
  | NotHandledSituation;

/**
 * @category Body
 */
const bodyOfScrollStories = (I: InputOfBody): WT.WebProgram<Output> => {
  /**
   * @category Abstraction
   */
  const returnNumberOfElements = (xpath: string) =>
    pipe(
      $x(xpath),
      WT.map((els) => els.length)
    );
  /**
   * @category Abstraction
   */
  const returnNumberOfAvailableStories = () =>
    returnNumberOfElements(I.settings.xpathOfBarsForStories);
  /**
   * @category Abstraction
   */
  const returnNumberOfViewedStories = () =>
    returnNumberOfElements(I.settings.xpathOfBarsForLoadingStories);
  /**
   * @category Abstraction
   */
  const returnInfoOfStories = (): WT.WebProgram<InfoOfStories> =>
    pipe(
      returnNumberOfAvailableStories(),
      WT.chain((availableStories) =>
        pipe(
          returnNumberOfViewedStories(),
          WT.map<number, InfoOfStories>((viewedStories) => ({
            availableStories,
            viewedStories,
          }))
        )
      )
    );
  /**
   * @description
   * Here we're assuming `availableStories` to be
   * greater than `0`.
   * @returns The limit of scrolls and current viewed stories.
   * @category Abstraction
   */
  const returnStartOfStoryCounter = ({
    availableStories,
    viewedStories,
  }: InfoOfStories): StoryCounter => {
    const maxStories = I.options.maxStories ?? availableStories;
    const min = () =>
      availableStories < maxStories ? availableStories : maxStories;
    const limit = min();
    return { limit, viewedStories };
  };
  /**
   * @category type-classes
   */
  type StoryCounter = { limit: number; viewedStories: number };
  /**
   * @category Abstraction
   */
  const tryToScrollStories = (delayBetweenClicks: number) => ({
    limit,
    viewedStories,
  }: StoryCounter): WT.WebProgram<StoryCounter> =>
    limit > viewedStories
      ? pipe(
          I.buttonNext,
          checkHTMLProperties(I.settings.expectedPropsOfButtonNext),
          WT.chain((stillExists) =>
            stillExists.length < 1
              ? pipe(
                  I.buttonNext,
                  click,
                  WT.chain(WT.delay(delayBetweenClicks)),
                  WT.chain(() =>
                    tryToScrollStories(delayBetweenClicks)({
                      limit,
                      viewedStories: viewedStories + 1,
                    })
                  )
                )
              : WT.of({ limit, viewedStories })
          )
        )
      : WT.of({ limit, viewedStories });
  /**
   * @category constructors
   */
  const parseCounterToOutput = (availableStories: number) => (
    storyCounter: StoryCounter
  ): Output => {
    const { limit, viewedStories } = storyCounter;
    const returnAvailableOutput = (
      tag: "AllWatched" | "SomeWatched" | "NotWatched" | "NotHandledSituation"
    ): Output => ({
      _tag: tag,
      limit,
      viewedStories,
      availableStories,
      maxStories: I.options.maxStories ?? "NotSpecified",
    });
    switch (true) {
      case limit === viewedStories:
        return returnAvailableOutput("AllWatched");
      case viewedStories > 0 && viewedStories < limit:
        return returnAvailableOutput("SomeWatched");
      case viewedStories === 0:
        return returnAvailableOutput("NotWatched");

      default:
        return returnAvailableOutput("NotHandledSituation");
    }
  };
  /**
   * @category Core
   */
  return pipe(
    returnInfoOfStories(),
    WT.chain((infoOfStories) =>
      infoOfStories.availableStories > 0
        ? pipe(
            returnStartOfStoryCounter(infoOfStories),
            tryToScrollStories(1000),
            WT.map<StoryCounter, Output>(
              parseCounterToOutput(infoOfStories.availableStories)
            )
          )
        : WT.of<Output>({ _tag: "NoAvailableStories" })
    )
  );
};

export interface Input {
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
  xpathOfBarsForStories: sets.pageOfStory.elements.barsOfStories.XPath,
  xpathOfBarsForLoadingStories:
    sets.pageOfStory.elements.barsOfLoadingForStories.XPath,
}))(settingsByLanguage);
export const scrollStories = (I: Input): WT.WebProgram<Output> =>
  bodyOfScrollStories({
    ...I,
    settings: getSettings(I.language),
  });
