import * as A from 'fp-ts/Array';
import { flow, pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import {
    Settings as SettingsInstagram, settingsByLanguage
} from 'WebTeer/Applications/Instagram/SettingsByLanguage';
import * as WT from 'WebTeer/index';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'WebTeer/settingsByLanguage';
import {
    $x, click, ElementProps, expectedLength, matchOneSetOfProperties
} from 'WebTeer/Utils/ElementHandle';

/**
 * @category Input of Body
 * @subcategory Subtype
 */
type PropertiesOfSvgInButton = ElementProps<HTMLOrSVGImageElement, string>;
/**
 * @category Input of Body
 * @subcategory Subtype
 */
type Settings = {
  propertiesPreLikeOfSvg: PropertiesOfSvgInButton[];
  propertiesPostLikeOfSvg: PropertiesOfSvgInButton[];
  relativeXPathOfSvgLike: string;
  relativeXPathOfSvgUnlike: string;
};
/**
 * @category Input of Body
 * @subcategory Parse to Subtype
 */
const languageSettings = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsInstagram
>((sets) => ({
  propertiesPreLikeOfSvg: sets.buttonLike.svg.expectedProps.preLike,
  propertiesPostLikeOfSvg: sets.buttonLike.svg.expectedProps.postLike,
  relativeXPathOfSvgLike: sets.buttonLike.svg.XPathPreLike,
  relativeXPathOfSvgUnlike: sets.buttonLike.svg.XPathPostLike,
}))(settingsByLanguage);
/**
 * @category Input of Body
 * @subcategory Subtype
 */
export interface Options {}
/**
 * @category Input of Body
 */
interface InputOfBody {
  button: ElementHandle<HTMLButtonElement>;
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
 * @subcategory To Union
 */
export interface Liked extends tag {
  _tag: "Liked";
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface AlreadyLiked extends tag {
  _tag: "AlreadyLiked";
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface WrongProps {
  wrongProps: PropertiesOfSvgInButton;
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface NotClicked extends tag {
  _tag: "NotClicked";
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface InvalidButton extends tag {
  _tag: "InvalidButton";
}
/**
 * @category Output
 * @subcategory Subtype
 */
export type Reason = AlreadyLiked | InvalidButton | NotClicked;
/**
 * @category Output
 * @subcategory To Union
 */
export interface NotLiked<T extends tag = never> extends tag {
  _tag: "NotLiked";
  reason: Reason | T;
}
/**
 * @category Output
 */
export type Output = Liked | NotLiked;
/**
 * @category Output
 * @subcategory Util
 */
const returnLikedAsOutput: () => Liked = () => ({ _tag: "Liked" });
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
const returnInvalidButtonAsOutput = (): NotLiked =>
  notLiked({ _tag: "InvalidButton" });
/**
 * @category Output
 * @subcategory Util
 */
const returnNotClickedAsOutput = (): NotLiked =>
  notLiked({ _tag: "NotClicked" });
/**
 * @category Output
 * @subcategory Util
 */
const returnAlreadyLikedAsOutput = () => notLiked({ _tag: "AlreadyLiked" });
/**
 * @category Body
 */
const getBodyOfClickButtonLike: (I: InputOfBody) => WT.WebProgram<Output> = (
  I
) => {
  /**
   * @category Body
   * @subcategory Abstraction
   */
  const like = () => pipe(click(I.button), WT.map(returnLikedAsOutput));
  /**
   * @category Body
   * @subcategory Abstraction
   */
  const isThereSvg = (XPath: string): WT.WebProgram<boolean> =>
    pipe(
      $x(XPath)(I.button),
      WT.chain(expectedLength((n) => n === 1)((els, r) => ({}))),
      WT.map(() => true),
      WT.orElse<boolean>(() => WT.of(false))
    );
  /**
   * @category Body
   * @subcategory Abstraction
   */
  const isThereSvgLike = () => isThereSvg(I.settings.relativeXPathOfSvgLike);
  /**
   * @category Body
   * @subcategory Abstraction
   */
  const isThereSvgUnlike = () =>
    isThereSvg(I.settings.relativeXPathOfSvgUnlike);
  /**
   * @category Body
   * @subcategory Core
   */
  return pipe(
    isThereSvgLike(),
    WT.chain((thereIs) =>
      thereIs
        ? like()
        : pipe(
            isThereSvgUnlike(),
            WT.map<boolean, Output>((thereIs) =>
              thereIs
                ? returnAlreadyLikedAsOutput()
                : returnInvalidButtonAsOutput()
            )
          )
    ),
    WT.chain((f) =>
      f._tag === "Liked"
        ? pipe(
            isThereSvgUnlike(),
            WT.map<boolean, Output>((thereIs) =>
              thereIs ? f : returnNotClickedAsOutput()
            )
          )
        : WT.of(f)
    )
  );
};
/**
 * @category Input
 */
export interface Input {
  button: ElementHandle<HTMLButtonElement>;
  language: Languages;
  options: Options;
}
/**
 * @category Program
 */
export const clickButtonLike = (I: Input) =>
  getBodyOfClickButtonLike({
    button: I.button,
    settings: languageSettings(I.language),
    options: I.options,
  });
