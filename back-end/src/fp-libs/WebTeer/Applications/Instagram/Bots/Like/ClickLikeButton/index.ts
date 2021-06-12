import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import * as WT from 'WebTeer/index';
import { LanguageSettingsKeys, languageSettingsSelector } from 'WebTeer/options';
import { click, ElementProps, matchOneSetOfProperties } from 'WebTeer/Utils/ElementHandle';
import {
    languageSettings as languageSettingsInstagram, Setting as SettingInstagram
} from 'WT-Instagram/LanguageSettings';

/**
 * Input
 */
type ButtonProps = ElementProps<HTMLButtonElement, string>;
type Settings = {
  buttonPreLikeProps: ButtonProps[];
  buttonPostLikeProps: ButtonProps[];
};
export interface Options {}
interface ClickLikeButtonBodyInput {
  button: ElementHandle<HTMLButtonElement>;
  settings: Settings;
  options: Options;
}
/**
 * Output
 */
export interface tag {
  _tag: string;
}
export interface Likeed extends tag {
  _tag: "Likeed";
}
interface AlreadyLikeed extends tag {
  _tag: "AlreadyLikeed";
}
interface WrongProps {
  wrongProps: ButtonProps;
}
interface NotClicked extends tag, WrongProps {
  _tag: "NotClicked";
}
interface InvalidButton extends tag, WrongProps {
  _tag: "InvalidButton";
}
export type Reason = AlreadyLikeed | InvalidButton | NotClicked;
export interface NotLikeed<R extends tag> extends tag {
  _tag: "NotLikeed";
  reason: R;
}
export type ClickLikeButtonOutput = Likeed | NotLikeed<Reason>;
/**
 * Output utils
 */
const followed: Likeed = { _tag: "Likeed" };
const notLikeed = (reason: Reason): NotLikeed<Reason> => ({
  _tag: "NotLikeed",
  reason,
});
const invalidButton = (wrongProps: ButtonProps): NotLikeed<Reason> =>
  notLikeed({ _tag: "InvalidButton", wrongProps });
const notClicked = (wrongProps: ButtonProps): NotLikeed<Reason> =>
  notLikeed({ _tag: "NotClicked", wrongProps });
const alreadyLikeed = notLikeed({ _tag: "AlreadyLikeed" });
/**
 * Program body
 */

const clickLikeButtonBody: (
  I: ClickLikeButtonBodyInput
) => WT.WebProgram<ClickLikeButtonOutput> = (I) => {
  const isValidButton = (): WT.WebProgram<ButtonProps> =>
    pipe(
      matchOneSetOfProperties<HTMLButtonElement, string>(
        I.settings.buttonPreLikeProps
      )(I.button),
      WT.map(A.flatten)
    );

  //
  const isLikeed_Recur = (n: number): WT.WebProgram<ButtonProps> =>
    pipe(
      matchOneSetOfProperties<HTMLButtonElement, string>(
        I.settings.buttonPostLikeProps
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
              WT.chain(() => isLikeed_Recur(n - 1))
            )
          : WT.of(wrongProps)
      )
    );
  const isLikeed: () => WT.WebProgram<ButtonProps> = () => isLikeed_Recur(5);
  /**
   *
   */
  return pipe(
    isValidButton(),
    WT.chain((wrongPropsVB) =>
      wrongPropsVB.length < 1
        ? pipe(
            click(I.button),
            WT.map(() => followed)
          )
        : pipe(
            isLikeed(),
            WT.map<ButtonProps, ClickLikeButtonOutput>((wrongPropsF) =>
              wrongPropsF.length < 1
                ? alreadyLikeed
                : invalidButton(wrongPropsVB)
            )
          )
    ),
    WT.chain((f) =>
      f._tag === "Likeed"
        ? pipe(
            isLikeed(),
            WT.map<ButtonProps, ClickLikeButtonOutput>((wrongPropsFPost) =>
              wrongPropsFPost.length < 1 ? f : notClicked(wrongPropsFPost)
            )
          )
        : WT.of(f)
    )
  );
};
/**
 * Program call
 */
export interface ClickLikeButtonInput {
  button: ElementHandle<HTMLButtonElement>;
  language: LanguageSettingsKeys;
  options: Options;
}

const languageSettings = languageSettingsSelector<Settings, SettingInstagram>(
  (sets) => ({
    buttonPreLikeProps: sets.buttonLike.expectedProps.preLike,
    buttonPostLikeProps: sets.buttonLike.expectedProps.postLike,
  })
)(languageSettingsInstagram);
//
export const clickLikeButton = (I: ClickLikeButtonInput) =>
  clickLikeButtonBody({
    button: I.button,
    settings: languageSettings(I.language),
    options: I.options,
  });
