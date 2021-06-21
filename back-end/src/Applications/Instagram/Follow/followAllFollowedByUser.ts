import * as A from 'fp-ts/Array';
import { log } from 'fp-ts/lib/Console';
import { pipe } from 'fp-ts/lib/function';
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import path from 'path';
import { ElementHandle } from 'puppeteer';
import * as WT from 'src';
import { waitFor$x } from 'src/dependencies';
import { click, expectedLength } from 'src/elementHandle';

import { followed } from '../../XPaths/profilePage';

const ABSOLUTE_PATH = path.resolve(__dirname, "./followAllFollowedByUser.ts");

interface FollowAllFollowedDeps {
  link_XPath_OR_selector: string;
  followFollowed_XPath_OR_selector: string;
  unfollowFollowed_XPath_OR_selector: string;
  scroller_XPath_OR_selector: string;
  getElementHandles: (
    xPath_OR_selector: string
  ) => WT.WebProgram<ElementHandle[] | []>;
  click: RTE.ReaderTaskEither<ElementHandle<Element>, Error, void>;
  msDelayBetweenFollows: number;
  settings: Settings;
  profileUrl: URL;
}
export const followed = {
  link: `//a[@class='-nal3 ' and contains(.,' profili seguiti')]`,
  follow: `//ul/div/li/div/div/button[text()='Segui']`,
  unfollow: `//ul/div/li/div/div/button[text()='Segui già']`,
  ul: `//ul[./div/li/div/div/button[contains(.,'Segui')]]`,
  divUl: `//div[./ul/div/li/div/div/button[contains(.,'Segui')]]`,
};
export const followButton = {
  // public: `//div[1]/div[1]/div/div/div/span/span[1]/button[contains(.,'Segui')]`,
  toClick: `//header//*/button[contains(text(),'Segui')]`,
  private: `//section/div/div/div/div/button[contains(.,'Segui')]`,
  official: `//section/div/div/div/div/div/span/span/button[contains(.,'Segui')]`,
  clicked: `//header//*/button[./div/span[@aria-label='Segui già']]`,
};
// -------------------------------
// Input of body
// -------------------------------
interface Settings {
  xpathOfLinkToListOfFollowed: string;
}
/**
 *
 */
interface InputOfBody {
  settings: Settings;
  profileUrl: URL;
}
/**
 *
 */
export const bodyOfProgram = (
  I: FollowAllFollowedDeps
): WT.WebProgram<void> => {
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
    WT.chain((els) => click(els[0])),
    WT.orElseStackErrorInfos({
      message: `Problem at page ${I.profileUrl.href}`,
      nameOfFunction: "showListOfFollowed",
      filePath: ABSOLUTE_PATH,
    })
  );
  const getFollowButtons = pipe(
    I.followFollowed_XPath_OR_selector,
    I.getElementHandles
  );
  const getUnfollowButtons = pipe(
    I.unfollowFollowed_XPath_OR_selector,
    I.getElementHandles
  );
  const getScroller = pipe(
    I.scroller_XPath_OR_selector,
    I.getElementHandles,
    RTE.chainTaskEitherK((els) =>
      A.isEmpty(els)
        ? TE.left(
            new Error(`No followed-list found for: ${I.link_XPath_OR_selector}`)
          )
        : TE.right(els)
    )
  );
  /**
   * -------------- Delay
   */
  /** */
  const delay_custom = (delay: number) => <A>(a: A): T.Task<A> => () =>
    new Promise((resolve) => setTimeout(resolve, delay)).then(() => a);
  // const wait = <A>(a: A): T.Task<A> => T.delay(deps.msDelayBtFollows)(T.of(a));
  const delay_default = delay_custom(I.msDelayBetweenFollows);
  /**
   * -------------- Single Follow
   */
  /** */
  const FollowButton = {
    texts: ["Segui", "Segui già", "Richiesta effettuata"],
    isValid: (textToMatch: string) =>
      FollowButton.texts.findIndex((text) => text === textToMatch) > -1,
    isFollow: (textToMatch: string) => FollowButton.texts[0] === textToMatch,
  };
  /**
   *
   */
  const checkFollow: RTE.ReaderTaskEither<
    ElementHandle<Element>,
    Error,
    void
  > = pipe(
    RTE.ask<ElementHandle<Element>, Error>(),
    RTE.chainTaskK((elHandle) => () =>
      elHandle.evaluate((el: HTMLButtonElement) => ({
        followText: el.textContent,
        profileName: (
          el.parentElement?.parentElement?.childNodes[0].childNodes[1] ??
          el.parentElement?.parentElement?.childNodes[1]
        )?.childNodes[0].textContent,
      }))
    ),
    RTE.chain(({ followText, profileName }) =>
      followText === null
        ? RTE.left(new Error(`No text found on follow button`))
        : !FollowButton.isValid(followText)
        ? RTE.left(
            new Error(`No text match on follow button for: ${followText}`)
          )
        : FollowButton.isFollow(followText)
        ? RTE.left(
            new Error(
              `Profile "${
                typeof profileName === "string"
                  ? profileName
                  : "NO_PROFILE_NAME_FOUND"
              }" NOT followed`
            )
          )
        : typeof profileName !== "string"
        ? RTE.left(new Error(`"NO_PROFILE_NAME_FOUND" after follow.`))
        : RTE.fromIO(log(`Followed profile: ${profileName}`))
    )
  );
  /**
   *
   */
  const followAfterTimeout: RTE.ReaderTaskEither<
    ElementHandle<Element>,
    Error,
    void
  > = pipe(
    RTE.of<ElementHandle<Element>, Error, void>(undefined),
    RTE.chainTaskK(delay_default),
    RTE.chain(() => I.click),
    RTE.chainTaskK(delay_custom(6000)),
    RTE.chain(() => checkFollow)
  );
  /**
   *
   */
  const followCurrents: RTE.ReaderTaskEither<
    ElementHandle<Element>[],
    Error,
    void
  > = pipe(
    RTE.ask<ElementHandle<Element>[]>(),
    RTE.chain((els) =>
      RTE.of({
        els: els,
        noElements: els.length < 1,
        isOneElementOnly: els.length === 1,
      })
    ),
    RTE.chainTaskEitherK((elements) =>
      elements.noElements
        ? TE.of(undefined)
        : pipe(
            followAfterTimeout(elements.els[0]),
            TE.chain(() =>
              elements.isOneElementOnly
                ? TE.of(undefined)
                : followCurrents(elements.els.slice(1))
            )
          )
    )
  );
  /**
   *
   */
  const scroll = pipe(
    getScroller,
    RTE.chainTaskK((scrollers) => () =>
      scrollers[0].evaluate((scroller: HTMLDivElement) =>
        scroller.scroll(0, scroller.scrollHeight)
      )
    )
  );
  // -------------------------------
  // Follow all followed users
  // -------------------------------
  const followAll = (attempts: number): WT.WebProgram<void> =>
    attempts > 1
      ? pipe(
          getFollowButtons,
          RTE.chain((els) =>
            A.isEmpty(els)
              ? RTE.of(attempts - 1)
              : pipe(
                  RTE.fromTaskEither(followCurrents(els)),
                  RTE.chain(() => scroll),
                  RTE.chain(() => RTE.of(attempts))
                )
          ),
          RTE.chainTaskK(delay_custom(3000)),
          RTE.chain(followAll)
        )
      : pipe(
          getUnfollowButtons,
          RTE.chain((els) =>
            A.isEmpty(els)
              ? RTE.left(
                  new Error(
                    "Follow attempts finished, but no 'Already followed' button matched."
                  )
                )
              : RTE.of(undefined)
          )
        );
  return pipe(
    showListOfFollowed,
    RTE.chain(() => followAll(3))
  );
};
