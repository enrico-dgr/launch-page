import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import {
    Settings as SettingsInstagram, settingsByLanguage
} from 'WebTeer/Applications/Instagram/SettingsByLanguage';
import * as WT from 'WebTeer/index';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'WebTeer/settingsByLanguage';
import { click, ElementProps, matchOneSetOfProperties } from 'WebTeer/Utils/ElementHandle';

/**
 * @category Input of Body
 * @subcategory Subtype
 */
type ButtonProps = ElementProps<HTMLButtonElement, string>;
/**
 * @category Input of Body
 * @subcategory Subtype
 */
type Settings = {
  buttonPreFollowProps: ButtonProps[];
  buttonPostFollowProps: ButtonProps[];
};
/**
 * @category Input of Body
 * @subcategory Parse to Subtype
 */
const languageSettings = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsInstagram
>((sets) => ({
  buttonPreFollowProps: sets.buttonFollow.expectedProps.preFollow,
  buttonPostFollowProps: sets.buttonFollow.expectedProps.postFollow,
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
export interface Followed extends tag {
  _tag: "Followed";
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface AlreadyFollowed extends tag {
  _tag: "AlreadyFollowed";
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface WrongProps {
  wrongProps: ButtonProps;
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface NotClicked extends tag, WrongProps {
  _tag: "NotClicked";
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface InvalidButton extends tag, WrongProps {
  _tag: "InvalidButton";
}
/**
 * @category Output
 * @subcategory Subtype
 */
export type Reason = AlreadyFollowed | InvalidButton | NotClicked;
/**
 * @category Output
 * @subcategory To Union
 */
export interface NotFollowed<T extends tag = never> extends tag {
  _tag: "NotFollowed";
  reason: Reason | T;
}
/**
 * @category Output
 */
export type Output = Followed | NotFollowed;
/**
 * @category Output
 * @subcategory Util
 */
const returnFollowedAsOutput: () => Followed = () => ({ _tag: "Followed" });
/**
 * @category Output
 * @subcategory Util
 */
const notFollowed = (reason: Reason): NotFollowed => ({
  _tag: "NotFollowed",
  reason,
});
/**
 * @category Output
 * @subcategory Util
 */
const returnInvalidButtonAsOutput = (wrongProps: ButtonProps): NotFollowed =>
  notFollowed({ _tag: "InvalidButton", wrongProps });
/**
 * @category Output
 * @subcategory Util
 */
const returnNotClickedAsOutput = (wrongProps: ButtonProps): NotFollowed =>
  notFollowed({ _tag: "NotClicked", wrongProps });
/**
 * @category Output
 * @subcategory Util
 */
const returnAlreadyFollowedAsOutput = () =>
  notFollowed({ _tag: "AlreadyFollowed" });
/**
 * @category Body
 */
const bodyOfClickButtonFollow: (I: InputOfBody) => WT.WebProgram<Output> = (
  I
) => {
  /**
   * @category Body
   * @subcategory Abstraction
   */
  const checkPropertiesOfButton = (): WT.WebProgram<ButtonProps> =>
    pipe(
      matchOneSetOfProperties<HTMLButtonElement, string>(
        I.settings.buttonPreFollowProps
      )(I.button),
      WT.map(A.flatten)
    );
  /**
   * @category Body
   * @subcategory Abstraction
   * @subcategory Body
   */
  const recursivelyCheckPropertiesOfClickedButton = (
    n: number
  ): WT.WebProgram<ButtonProps> =>
    pipe(
      matchOneSetOfProperties<HTMLButtonElement, string>(
        I.settings.buttonPostFollowProps
      )(I.button),
      WT.map(A.flatten),
      WT.chain<
        ElementProps<HTMLButtonElement, string>,
        ElementProps<HTMLButtonElement, string>
      >((wrongProps) =>
        wrongProps.length > 0 && n > 0
          ? pipe(
              undefined,
              WT.delay(1000),
              WT.chain(() => recursivelyCheckPropertiesOfClickedButton(n - 1))
            )
          : WT.of(wrongProps)
      )
    );
  /**
   * @category Body
   * @subcategory Abstraction
   */
  const checkPropertiesOfClickedButton: () => WT.WebProgram<ButtonProps> = () =>
    recursivelyCheckPropertiesOfClickedButton(5);
  /**
   * @category Body
   * @subcategory Core
   */
  return pipe(
    checkPropertiesOfButton(),
    WT.chain((wrongPropsBF) =>
      wrongPropsBF.length < 1
        ? pipe(
            click(I.button),
            WT.map(() => returnFollowedAsOutput())
          )
        : pipe(
            checkPropertiesOfClickedButton(),
            WT.map<ButtonProps, Output>((wrongPropsCBF) =>
              wrongPropsCBF.length < 1
                ? returnAlreadyFollowedAsOutput()
                : returnInvalidButtonAsOutput(wrongPropsBF)
            )
          )
    ),
    WT.chain((f) =>
      f._tag === "Followed"
        ? pipe(
            checkPropertiesOfClickedButton(),
            WT.map<ButtonProps, Output>((wrongPropsCBF) =>
              wrongPropsCBF.length < 1
                ? f
                : returnNotClickedAsOutput(wrongPropsCBF)
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
export const clickButtonFollow = (I: Input) =>
  bodyOfClickButtonFollow({
    button: I.button,
    settings: languageSettings(I.language),
    options: I.options,
  });
