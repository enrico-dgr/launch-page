import { pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import * as WT from 'WebTeer/index';
import { LanguageSettingsKeys, languageSettingsSelector } from 'WebTeer/options';
import { checkProperties, click, ElementProps } from 'WebTeer/Utils/ElementHandle';
import {
    languageSettings as languageSettingsInstagram, Setting as SettingInstagram
} from 'WT-Instagram/LanguageSettings';

/**
 * Input
 */
type ButtonProps = ElementProps<HTMLButtonElement, string>;
type Settings = {
  buttonPreFollowProps: ButtonProps;
  buttonPostFollowProps: ButtonProps;
};
export interface Options {}
/**
 * Output
 */
export interface tag {
  _tag: string;
}
export interface Followed extends tag {
  _tag: "Followed";
}
interface AlreadyFollowed extends tag {
  _tag: "AlreadyFollowed";
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
export type Reason = AlreadyFollowed | InvalidButton | NotClicked;
export interface NotFollowed<R extends tag> extends tag {
  _tag: "NotFollowed";
  reason: R;
}
export type ClickFollowButtonOutput = Followed | NotFollowed<Reason>;
/**
 * Output utils
 */
const followed: Followed = { _tag: "Followed" };
const notFollowed = (reason: Reason): NotFollowed<Reason> => ({
  _tag: "NotFollowed",
  reason,
});
const invalidButton = (wrongProps: ButtonProps): NotFollowed<Reason> =>
  notFollowed({ _tag: "InvalidButton", wrongProps });
const notClicked = (wrongProps: ButtonProps): NotFollowed<Reason> =>
  notFollowed({ _tag: "NotClicked", wrongProps });
const alreadyFollowed = notFollowed({ _tag: "AlreadyFollowed" });
/**
 * Program body
 */

interface ClickFollowButtonBodyInput {
  button: ElementHandle<HTMLButtonElement>;
  settings: Settings;
  options: Options;
}
const clickFollowButtonBody: (
  I: ClickFollowButtonBodyInput
) => WT.WebProgram<ClickFollowButtonOutput> = (I) => {
  const isValidButton = () =>
    checkProperties(I.settings.buttonPreFollowProps)(I.button);
  const isFollowed = () =>
    checkProperties(I.settings.buttonPostFollowProps)(I.button);
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
            isFollowed(),
            WT.map<ButtonProps, ClickFollowButtonOutput>((wrongPropsF) =>
              wrongPropsF.length < 1
                ? alreadyFollowed
                : invalidButton(wrongPropsVB)
            )
          )
    ),
    WT.chain((f) =>
      f._tag === "Followed"
        ? pipe(
            isFollowed(),
            WT.map<ButtonProps, ClickFollowButtonOutput>((wrongPropsFPost) =>
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
export interface ClickFollowButtonInput {
  button: ElementHandle<HTMLButtonElement>;
  language: LanguageSettingsKeys;
  options: Options;
}

const languageSettings = languageSettingsSelector<Settings, SettingInstagram>(
  (sets) => ({
    buttonPreFollowProps: sets.buttonFollow.expectedProps.preFollow,
    buttonPostFollowProps: sets.buttonFollow.expectedProps.postFollow,
  })
)(languageSettingsInstagram);
//
export const clickFollowButton = (I: ClickFollowButtonInput) =>
  clickFollowButtonBody({
    button: I.button,
    settings: languageSettings(I.language),
    options: I.options,
  });
