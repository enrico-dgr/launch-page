import { pipe } from "fp-ts/lib/function";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import * as A from "fp-ts/Array";
import { ElementHandle } from "puppeteer";
import { WebDeps } from "../../..";
import { log } from "fp-ts/lib/Console";

interface FollowAllFollowedDeps {
  link_XPath_OR_selector: string;
  followFollowed_XPath_OR_selector: string;
  unfollowFollowed_XPath_OR_selector: string;
  scroller_XPath_OR_selector: string;
  getElementHandles: (
    xPath_OR_selector: string
  ) => RTE.ReaderTaskEither<WebDeps, Error, ElementHandle[] | []>;
  click: RTE.ReaderTaskEither<ElementHandle<Element>, Error, void>;
  msDelayBetweenFollows: number;
}

export const fAF_fAFDeps = (
  deps: FollowAllFollowedDeps
): RTE.ReaderTaskEither<WebDeps, Error, void> => {
  /**
   * -------------- Element
   */
  /** */
  const showListOfFollowed = pipe(
    deps.link_XPath_OR_selector,
    deps.getElementHandles,
    RTE.chainTaskEitherK((els) =>
      A.isEmpty(els)
        ? TE.left(
            new Error(
              `No followed-list found for: ${deps.link_XPath_OR_selector}`
            )
          )
        : deps.click(els[0])
    )
  );
  const getFollowButtons = pipe(
    deps.followFollowed_XPath_OR_selector,
    deps.getElementHandles
  );
  const getUnfollowButtons = pipe(
    deps.unfollowFollowed_XPath_OR_selector,
    deps.getElementHandles
  );
  const getScroller = pipe(
    deps.scroller_XPath_OR_selector,
    deps.getElementHandles,
    RTE.chainTaskEitherK((els) =>
      A.isEmpty(els)
        ? TE.left(
            new Error(
              `No followed-list found for: ${deps.link_XPath_OR_selector}`
            )
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
  const delay_default = delay_custom(deps.msDelayBetweenFollows);
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
  const followAfterTimeout: RTE.ReaderTaskEither<
    ElementHandle<Element>,
    Error,
    void
  > = pipe(
    RTE.of<ElementHandle<Element>, Error, void>(undefined),
    RTE.chainTaskK(delay_default),
    RTE.chain(() => deps.click),
    RTE.chainTaskK(delay_custom(6000)),
    RTE.chain(() => checkFollow)
  );
  /**
   * -------------- Multiple Follow
   */
  /** */
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
   * -------------- Page Movement
   */
  /** */
  const scroll = pipe(
    getScroller,
    RTE.chainTaskK((scrollers) => () =>
      scrollers[0].evaluate((scroller: HTMLDivElement) =>
        scroller.scroll(0, scroller.scrollHeight)
      )
    )
  );
  /**
   * -------------- Follow the whole list
   */
  /** */
  const followAll = (
    attempts: number
  ): RTE.ReaderTaskEither<WebDeps, Error, void> =>
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
