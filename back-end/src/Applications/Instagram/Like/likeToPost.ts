import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import {
    Settings as SettingsInstagram, settingsByLanguage as settingsOfInstagramByLanguage
} from 'src/Applications/Instagram/SettingsByLanguage';
import { $x } from 'src/dependencies';
import { expectedLength } from 'src/elementHandle';
import * as WT from 'src/index';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'src/settingsByLanguage';
import { goto, StateOfInstagramPage } from 'WebTeer/Applications/Instagram/goto';

import {
    clickButtonLike, Liked as LikedOfClickButtonLike, NotLiked as NotLikedOfClickButtonLike,
    Options, Reason as ReasonOfClickButtonLike, tag
} from './clickButtonLike';

/**
 * @category Input of Body
 * @subcategory Subtype
 */
interface Settings {
  buttonLikeXPath: string;
  buttonUnlikeXPath: string;
}
/**
 * @category Input of Body
 * @subcategory Parse to Subtype
 */
const settingsByLanguage = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsInstagram
>((sets) => ({
  buttonLikeXPath: sets.igPostPage.elements.buttonLike.XPath,
  buttonUnlikeXPath: sets.igPostPage.elements.buttonUnlike.XPath,
}))(settingsOfInstagramByLanguage);
/**
 * @category Input of Body
 */
export interface InputOfBody {
  profileUrl: URL;
  settings: Settings;
  language: Languages;
  options: Options;
}
/**
 * @category Output
 * @subcategory To Union
 */
interface Liked extends LikedOfClickButtonLike {}
/**
 * @category Output
 * @subcategory Subtype
 */
interface PageState extends tag {
  _tag: StateOfInstagramPage;
}
/**
 * @category Output
 * @subcategory Subtype
 */
export type Reason = ReasonOfClickButtonLike | PageState;
/**
 * @category Output
 * @subcategory To Union
 */
interface NotLiked extends NotLikedOfClickButtonLike<Reason> {}
/**
 * @category Output
 */
export type Output = Liked | NotLiked;
/**
 * @category Output
 * @subcategory Util
 */
const notLiked = (reason: Reason): NotLiked => ({
  _tag: "NotLiked",
  reason,
});
/**
 * @category Output
 * @subcategory Util
 */
const returnOutputNotAvailablePage = () =>
  notLiked({
    _tag: "NotAvailablePage",
  });

/**
 * @category Body
 */
const bodyOfLikeToPost = (I: InputOfBody): WT.WebProgram<Output> => {
  /**
   * @category Body
   * @subcategory Abstraction
   */
  const isOnPage = () =>
    pipe(WT.asks((r) => r.page.url() === I.profileUrl.href));
  /**
   * @category Body
   * @subcategory Abstraction
   */
  const button = (name: "Like" | "Unlike", XPath: string) =>
    pipe(
      $x(XPath),
      WT.chain(
        expectedLength((n) => n === 1)((els, r) => ({
          ["button" + name + "XPath"]: XPath,
          lenght: els.length,
          url: r.page.url(),
        }))
      ),
      WT.map((els) => els[0])
    );
  /**
   * @description search like-button in profile page
   * @category Body
   * @subcategory Abstraction
   */
  const buttonLike = () => button("Like", I.settings.buttonLikeXPath);
  /**
   * @description search unlike-button in profile page
   * @category Body
   * @subcategory Abstraction
   */
  const buttonUnlike = () => button("Unlike", I.settings.buttonUnlikeXPath);
  /**
   * @description main part of the program.
   * It finds and clicks the button
   * through the `ClickButtonLike` function.
   * @category Body
   * @subcategory Abstraction
   */
  const like: () => WT.WebProgram<Output> = () =>
    pipe(
      buttonLike(),
      WT.orElse(buttonUnlike),
      WT.chain((button) =>
        clickButtonLike({
          language: I.language,
          options: { ...I.options },
          button,
        })
      )
    );
  /**
   * @category Body
   * @subcategory Core
   */
  return pipe(
    isOnPage(),
    WT.chain((itIs) =>
      itIs
        ? WT.of<StateOfInstagramPage>("AvailablePage")
        : goto(I.language)(I.profileUrl.href)
    ),
    WT.chain<StateOfInstagramPage, Output>((res) =>
      res === "NotAvailablePage"
        ? WT.of<Output>(returnOutputNotAvailablePage())
        : like()
    )
  );
};
/**
 * @category Input
 */
export interface Input {
  profileUrl: URL;
  language: Languages;
  options: Options;
}
/**
 * @category Program
 */
export const likeToPost = (I: Input) =>
  bodyOfLikeToPost({
    ...I,
    settings: settingsByLanguage(I.language),
  });
