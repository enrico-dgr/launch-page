import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import {
    Settings as SettingsInstagram, settingsByLanguage
} from 'src/Applications/Instagram/SettingsByLanguage';
import { $x } from 'src/dependencies';
import { expectedLength } from 'src/elementHandle';
import * as WT from 'src/index';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'src/settingsByLanguage';
import { goto, StateOfInstagramPage } from 'WebTeer/Applications/Instagram/goto';

import {
    clickButtonFollow, Followed as FollowedOfClickButtonFollow,
    NotFollowed as NotFollowedOfClickButtonFollow, Options as OptionsOfClickButtonFollow,
    Output as OutputOfClickButtonFollow, Reason as ReasonOfClickButtonFollow, tag
} from './clickButtonFollow';

/**
 * @category Input of Body
 * @subcategory Subtype
 */
interface Options extends OptionsOfClickButtonFollow {
  /**
   * on *true* allows private profiles to be followed
   */
  allowPrivate: boolean;
}
/**
 * @category Input of Body
 * @subcategory Subtype
 */
interface Settings {
  privateProfileXPath: string;
  buttonFollowXPath: string;
  buttonAlreadyFollowXPath: string;
}
/**
 * @category Input of Body
 * @subcategory Parse to Subtype
 */
const languageSettings = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsInstagram
>((sets) => ({
  privateProfileXPath: sets.profilePage.elements.privateProfile.XPath,
  buttonFollowXPath: sets.profilePage.elements.buttonFollow.XPath,
  buttonAlreadyFollowXPath: sets.profilePage.elements.buttonAlreadyFollow.XPath,
}))(settingsByLanguage);
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
 * @subcategory Subtype
 */
interface IsPrivate {
  isPrivate: boolean;
}
/**
 * @category Output
 * @subcategory To Union
 */
interface Followed extends FollowedOfClickButtonFollow, IsPrivate {}
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
interface CannotFollowPrivate extends tag {
  _tag: "CannotFollowPrivate";
}
/**
 * @category Output
 * @subcategory Subtype
 */
export type Reason =
  | ReasonOfClickButtonFollow
  | CannotFollowPrivate
  | PageState;
/**
 * @category Output
 * @subcategory To Union
 */
interface NotFollowed
  extends NotFollowedOfClickButtonFollow<Reason>,
    IsPrivate {}
/**
 * @category Output
 */
export type Output = Followed | NotFollowed;
/**
 * @category Output
 * @subcategory Util
 */
const notFollowed = (reason: Reason, isPrivate: boolean): NotFollowed => ({
  _tag: "NotFollowed",
  reason,
  isPrivate,
});
/**
 * @category Output
 * @subcategory Util
 */
const returnCannotFollowPrivateAsOutput = (isPrivate: boolean) =>
  notFollowed(
    {
      _tag: "CannotFollowPrivate",
    },
    isPrivate
  );
/**
 * @category Output
 * @subcategory Util
 */
const returnNotAvailablePageAsOutput = () =>
  notFollowed(
    {
      _tag: "NotAvailablePage",
    },
    false
  );

/**
 * @category Body
 */
const bodyOfFollowUser = (I: InputOfBody): WT.WebProgram<Output> => {
  /**
   * @category Body
   * @subcategory Abstraction
   */
  const isOnPage = pipe(WT.asks((r) => r.page.url() === I.profileUrl.href));
  /**
   * @category Body
   * @subcategory Abstraction
   * @subcategory Body
   */
  const recursivelyCheckIfItIsAPrivateProfile = (
    n: number
  ): WT.WebProgram<boolean> =>
    pipe(
      $x(I.settings.privateProfileXPath),
      WT.map(A.isNonEmpty),
      WT.chain(WT.delay(500)),
      WT.chain((b) =>
        b
          ? WT.of(b)
          : n > 0
          ? recursivelyCheckIfItIsAPrivateProfile(n - 1)
          : WT.of(b)
      )
    );
  /**
   * @description check 3 times each 0.5 seconds if profile is private
   * @category Body
   * @subcategory Abstraction
   */
  const isAPrivateProfile = () => recursivelyCheckIfItIsAPrivateProfile(3);
  /**
   * @description search follow-button in profile page
   * @category Body
   * @subcategory Abstraction
   */
  const button = (XPath: string) =>
    pipe(
      $x(XPath),
      WT.chain(
        expectedLength((n) => n === 1)((els, r) => ({
          // buttonFollowXPath: XPath,
          // lenght: els.length,
          // url: r.page.url(),
        }))
      ),
      WT.map((els) => els[0])
    );
  const buttonFollow = () => button(I.settings.buttonFollowXPath);
  const buttonAlreadyFollow = () => button(I.settings.buttonAlreadyFollowXPath);
  /**
   * @description main part of the program.
   * It finds and clicks the button
   * through the `ClickFollowButton` function.
   * @category Body
   * @subcategory Abstraction
   */
  const follow = pipe(
    buttonFollow(),
    WT.orElse(buttonAlreadyFollow),
    WT.chain((button) =>
      clickButtonFollow({
        language: I.language,
        options: { ...I.options },
        button,
      })
    )
  );
  /**
   * @description Parses the output of `ClickFollowButton` into
   * the output of this program.
   * @category Body
   * @subcategory Abstraction
   */
  const parseOutput = (isPrivate: boolean) => (
    o: OutputOfClickButtonFollow
  ): Output => ({ ...o, isPrivate });
  /**
   * @description based on `allowPrivate` option, decides if trying
   * on follow the profile or not.
   * @category Body
   * @subcategory Abstraction
   */
  const tryToFollowCheckingForPrivateProfile = () =>
    pipe(
      undefined,
      WT.delay(1000),
      WT.chain(isAPrivateProfile),
      WT.chain((isPrivate) =>
        isPrivate === true && I.options.allowPrivate === false
          ? WT.of<Output>(returnCannotFollowPrivateAsOutput(isPrivate))
          : pipe(follow, WT.map(parseOutput(isPrivate)))
      )
    );
  /**
   * @category Body
   * @subcategory Core
   */
  return pipe(
    isOnPage,
    WT.chain((isOnPageForReal) =>
      isOnPageForReal
        ? WT.of<StateOfInstagramPage>("AvailablePage")
        : goto(I.language)(I.profileUrl.href)
    ),
    WT.chain<StateOfInstagramPage, Output>((res) =>
      res === "NotAvailablePage"
        ? WT.of<Output>(returnNotAvailablePageAsOutput())
        : tryToFollowCheckingForPrivateProfile()
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
export const followUser = (I: Input) =>
  bodyOfFollowUser({
    ...I,
    settings: languageSettings(I.language),
  });
