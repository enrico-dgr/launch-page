import { pipe } from 'fp-ts/lib/function';
import { click, expectedLength } from 'src/elementHandle';
import { $x, waitFor$x } from 'WebTeer/pageOfWebDeps';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'WebTeer/SettingsByLanguage';
import * as WT from 'WebTeer/WebProgram';
import {
    Settings as SettingsOfInstagram, settingsByLanguage
} from 'WT-Instagram/SettingsByLanguage';

import { goto, StateOfInstagramPage } from '../goto';
import { Options, Output as OutputOfScrollStories, scrollStories, tag } from './scrollStories';

interface Settings {
  xpathOfButtonPermission: string;
  xpathOfButtonNext: string;
}
/**
 * @category Input of Body
 */
interface InputOfBody {
  storyUrl: URL;
  settings: Settings;
  options: Options;
  language: Languages;
}
/**
 * @category type-classes
 * @subcategory Output
 */
interface PageState extends tag {
  _tag: StateOfInstagramPage;
}
/**
 * @category Output
 */
type Output = PageState | OutputOfScrollStories;
/**
 * @category Body
 */
const bodyOfWatchStoryAtUrl = (I: InputOfBody) => {
  /**
   * @description
   * Tries to click on permission-button.
   * Recur+$x is used instead of waitFor$x,
   * but maybe is to change. @todo <--
   * @returns
   * - *true* on verified clicked
   * - *false* otherwise
   * @category Abstraction
   */
  const showStories = (
    delay: number,
    attempts: number
  ): WT.WebProgram<boolean> =>
    attempts > 0
      ? pipe(
          $x(I.settings.xpathOfButtonPermission),
          WT.chain(
            expectedLength((n) => n === 1)(
              (els, r) => `${els.length} permission-button to story`
            )
          ),
          WT.map((els) => els[0]),
          WT.chain(click()),
          WT.map(() => true),
          WT.orElse(() =>
            pipe(
              undefined,
              WT.delay(delay),
              WT.chain(() => showStories(delay, attempts - 1))
            )
          )
        )
      : WT.of(false);
  /**
   * @description
   * Verify if permission-button disappeared.
   * @category Abstraction
   */
  const checkIfButtonPermissionIsGone = () =>
    pipe(
      $x(I.settings.xpathOfButtonPermission),
      WT.chain(
        expectedLength((n) => n === 0)(
          (els, r) => `${els.length} permission-button to story`
        )
      ),
      WT.map(() => true),
      WT.orElse(() => WT.of<boolean>(false))
    );
  /**
   * @returns the button to scroll stories
   * from left to right.
   * @category Abstraction
   */
  const returnButtonNext = () =>
    pipe(
      $x(I.settings.xpathOfButtonNext),
      WT.chain(
        expectedLength((n) => n === 1)(
          (els, r) => `${els.length} scrollRight-button in story`
        )
      ),
      WT.map((btns) => btns[0])
    );
  /**
   * @category Core
   */
  return pipe(
    goto(I.language)(I.storyUrl.href),
    WT.chain((pageState) =>
      pageState !== "AvailablePage"
        ? WT.of<Output>({ _tag: pageState })
        : pipe(
            showStories(500, 10),
            WT.chain((permissionIsGiven) =>
              permissionIsGiven ? checkIfButtonPermissionIsGone() : WT.of(false)
            ),
            WT.chain((storiesAreShown) =>
              storiesAreShown === false
                ? WT.of<Output>({ _tag: "NoAvailableStories" })
                : pipe(
                    returnButtonNext(),
                    WT.chain((buttonNext) =>
                      scrollStories({
                        language: I.language,
                        options: I.options,
                        buttonNext,
                      })
                    )
                  )
            )
          )
    )
  );
};
/**
 * @category type-classes
 */
interface Input {
  storyUrl: URL;
  language: Languages;
  options: Options;
}
/**
 * @category constructors
 */
const getSettings: (
  lang: Languages
) => Settings = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsOfInstagram
>((sets) => ({
  xpathOfButtonNext: sets.pageOfStory.elements.buttonToScrollStory.XPath,
  xpathOfButtonPermission: sets.pageOfStory.elements.buttonForPermission.XPath,
}))(settingsByLanguage);
/**
 * @description Given a Url of a story-collection,
 * watch a given number (or all, if not specified)
 * of stories in that collection.
 * It assumes that, loading a new page of story,
 * instagram will ask for permission of profile and
 * will not switch to a new story-collection at
 * the end of the current one.
 * @category program
 */
export const watchStoryAtUrl = (I: Input): WT.WebProgram<Output> =>
  bodyOfWatchStoryAtUrl({
    ...I,
    settings: getSettings(I.language),
  });
