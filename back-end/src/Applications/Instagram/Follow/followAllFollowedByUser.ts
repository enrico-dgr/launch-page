import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import path from 'path';
import { ElementHandle } from 'puppeteer';
import * as WT from 'src';
import { waitFor$x } from 'src/dependencies';
import { click, expectedLength } from 'src/elementHandle';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'src/settingsByLanguage';
import {
    Settings as SettingsOfInstagram, settingsByLanguage as settingsByLanguageOfInstagram
} from 'WT-Instagram/SettingsByLanguage';

import { goto } from '../goto';
import { clickButtonFollow } from './clickButtonFollow';

const ABSOLUTE_PATH = path.resolve(__dirname, "./followAllFollowedByUser.ts");

// -------------------------------
// Input of body
// -------------------------------
interface Settings {
  xpathOfLinkToListOfFollowed: string;
  xpathOfButtonFollowForFollowed: string;
  xpathOfButtonUnfollowForFollowed: string;
  xpathOfScrollableElement: string;
}
/**
 *
 */
interface InputOfBody {
  settings: Settings;
  profileUrl: URL;
  language: Languages;
}
/**
 *
 */
const bodyOfProgram = (I: InputOfBody): WT.WebProgram<void> => {
  // -------------------------------
  // Show list of followed users
  // -------------------------------
  const showListOfFollowed = pipe(
    I.settings.xpathOfLinkToListOfFollowed,
    waitFor$x,
    WT.chain(
      expectedLength((n) => n === 1)(() => ({
        message: `No followed-list found for: ${I.settings.xpathOfLinkToListOfFollowed}`,
      }))
    ),
    WT.chain((els) => click()(els[0])),
    WT.orElseStackErrorInfos({
      message: `Problem at page ${I.profileUrl.href}`,
      nameOfFunction: "showListOfFollowed",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const getFollowButtons = pipe(
    I.settings.xpathOfButtonFollowForFollowed,
    waitFor$x
  );
  /**
   *
   */
  const getUnfollowButtons = pipe(
    I.settings.xpathOfButtonUnfollowForFollowed,
    waitFor$x
  );
  /**
   *
   */
  const scroller: WT.WebProgram<ElementHandle<Element>> = pipe(
    I.settings.xpathOfScrollableElement,
    waitFor$x,
    WT.chain(
      expectedLength((n) => n === 1)(() => ({
        message: `No element to scroll in followed-list found for: ${I.settings.xpathOfScrollableElement}`,
      }))
    ),
    WT.map((els) => els[0]),
    WT.orElseStackErrorInfos({
      message: `Problem at page ${I.profileUrl.href}`,
      nameOfFunction: "scroller",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const scroll: () => WT.WebProgram<void> = () =>
    pipe(
      scroller,
      WT.chainTaskK((scrollers) => () =>
        scrollers.evaluate((scroller: HTMLDivElement) =>
          scroller.scroll(0, scroller.scrollHeight)
        )
      )
    );

  /**
   *
   */
  const followCurrents = (els: ElementHandle<Element>[]): WT.WebProgram<void> =>
    A.isEmpty(els)
      ? WT.of(undefined)
      : pipe(
          clickButtonFollow({
            button: els[0],
            language: "it",
            options: {},
          }),
          WT.chainFirst((output) =>
            output._tag === "Followed"
              ? WT.of(undefined)
              : WT.leftFromErrorInfos({
                  message: JSON.stringify(output),
                  nameOfFunction: "followCurrents",
                  filePath: ABSOLUTE_PATH,
                })
          ),
          WT.chain(WT.delay(4000)),
          WT.chain(() => followCurrents(els.slice(1)))
        );
  // -------------------------------
  // Follow all followed users
  // -------------------------------
  const followAll = (attempts: number): WT.WebProgram<void> =>
    attempts > 1
      ? pipe(
          getFollowButtons,
          WT.chain((els) =>
            A.isEmpty(els)
              ? followAll(attempts - 1)
              : pipe(
                  followCurrents(els),
                  WT.chain(scroll),
                  WT.chain(() => followAll(attempts))
                )
          )
        )
      : pipe(
          getUnfollowButtons,
          WT.chain((els) =>
            A.isNonEmpty(els)
              ? WT.of(undefined)
              : WT.left(
                  new Error(
                    "Follow attempts finished, but no 'Already followed' button matched."
                  )
                )
          )
        );
  return pipe(
    goto(I.language)(I.profileUrl.href),
    WT.chain(() => showListOfFollowed),
    WT.chain(() => followAll(3))
  );
};
// -------------------------------
// Program
// -------------------------------
interface Input {
  language: Languages;
  profileUrl: URL;
}
/**
 *
 */
const settingsByLanguage = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsOfInstagram
>((sets) => ({
  xpathOfButtonFollowForFollowed:
    sets.profilePage.elements.followedUsers.buttonFollow.XPath,
  xpathOfButtonUnfollowForFollowed:
    sets.profilePage.elements.followedUsers.buttonAlreadyFollow.XPath,
  xpathOfLinkToListOfFollowed: sets.profilePage.elements.followedUsers.XPath,
  xpathOfScrollableElement:
    sets.profilePage.elements.followedUsers.containerToScroll.XPath,
}))(settingsByLanguageOfInstagram);

/**
 *
 */
export const followAllFollowedByUser = (I: Input) =>
  bodyOfProgram({
    ...I,
    settings: settingsByLanguage(I.language),
  });
