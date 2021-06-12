import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';
import { LanguageSettingsKeys, languageSettingsSelector } from 'WebTeer/options';
import { expectedLength } from 'WebTeer/Utils/ElementHandle';
import { $x, goto } from 'WebTeer/Utils/WebDeps';
import {
    languageSettings as languageSettingsInstagram, Setting as SettingInstagram
} from 'WT-Instagram/LanguageSettings';

import {
    clickFollowButton, Followed, NotFollowed, Options as OptionsCFBO, Reason as ReasonCFBO, tag
} from '../ClickFollowButton';

interface Options extends OptionsCFBO {
  /**
   * on *true* allows private profiles to be followed
   */
  allowPrivate: boolean;
}
interface Settings {
  privateProfileXPath: string;
  buttonFollowXPath: string;
}

export interface FollowUserBodyInput {
  profileUrl: URL;
  settings: Settings;
  language: LanguageSettingsKeys;
  options: Options;
}
interface CannotFollowPrivate extends tag {
  _tag: "CannotFollowPrivate";
}
export type Reason = ReasonCFBO | CannotFollowPrivate;

export type FollowUserOutput = (Followed | NotFollowed<Reason>) & {
  isPrivate: boolean;
};
/**
 * program body
 */
const followUserBody = (
  I: FollowUserBodyInput
): WT.WebProgram<FollowUserOutput> => {
  //
  const isOnPage = pipe(WT.asks((r) => r.page.url() === I.profileUrl.href));
  //
  const isPrivate_Recur = (n: number): WT.WebProgram<boolean> =>
    pipe(
      $x(I.settings.privateProfileXPath),
      WT.map(A.isNonEmpty),
      WT.chain(WT.delay(500)),
      WT.chain((b) =>
        b ? WT.of(b) : n > 0 ? isPrivate_Recur(n - 1) : WT.of(b)
      )
    );
  const isPrivate = () => isPrivate_Recur(3);
  //
  const getButtonFollow = pipe(
    $x(I.settings.buttonFollowXPath),
    WT.chain(
      expectedLength((n) => n === 1)((els, r) => ({
        buttonFollowXPath: I.settings.buttonFollowXPath,
        lenght: els.length,
        url: r.page.url(),
      }))
    ),
    WT.map((els) => els[0])
  );

  return pipe(
    isOnPage,
    WT.chain((b) => (b ? WT.of(undefined) : goto(I.profileUrl.href))),
    WT.chain(WT.delay(1000)),
    WT.chain(isPrivate),
    WT.chain((isPrvt) =>
      isPrvt === true && I.options.allowPrivate === false
        ? WT.of<FollowUserOutput>({
            _tag: "NotFollowed",
            reason: {
              _tag: "CannotFollowPrivate",
            },
            isPrivate: isPrvt,
          })
        : pipe(
            getButtonFollow,
            WT.chain((button) =>
              clickFollowButton({
                language: I.language,
                options: { ...I.options },
                button,
              })
            ),
            WT.chain((o) =>
              WT.of<FollowUserOutput>({
                ...o,
                isPrivate: isPrvt,
              })
            )
          )
    )
  );
};
/**
 * program
 */
const languageSettings = languageSettingsSelector<Settings, SettingInstagram>(
  (sets) => ({
    privateProfileXPath: sets.profilePage.elements.privateProfile.XPath,
    buttonFollowXPath: sets.profilePage.elements.buttonFollow.XPath,
  })
)(languageSettingsInstagram);
export interface FollowUserInput {
  profileUrl: URL;
  language: LanguageSettingsKeys;
  options: Options;
}
export const followUser = (I: FollowUserInput) =>
  followUserBody({
    ...I,
    settings: languageSettings(I.language),
  });
