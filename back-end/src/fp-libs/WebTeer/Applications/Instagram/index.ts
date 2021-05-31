import * as WebDepsUtils from "../../Utils/WebDeps";
import * as ElementUtils from "../../Utils/ElementHandle";
import * as Follow from "./Follow";
import * as WebTeer from "../../index";
import * as PageXPaths from "./XPaths/profilePage";
import { pipe } from "fp-ts/lib/function";
import { ElementHandle, Page } from "puppeteer";
import * as S from "fp-ts/lib/Semigroup";

/**
 * @todo change this shit into the new pattern and think about overload
 */
export const followedOfProfile = (
  msDelayBetweenFollows: number
): WebTeer.WebProgram<void> =>
  Follow.fAF_fAFDeps({
    link_XPath_OR_selector: PageXPaths.followed.link,
    followFollowed_XPath_OR_selector: PageXPaths.followed.follow,
    unfollowFollowed_XPath_OR_selector: PageXPaths.followed.unfollow,
    scroller_XPath_OR_selector: PageXPaths.followed.divUl,
    getElementHandles: WebDepsUtils.waitFor$x,
    click: ElementUtils.oldClick,
    msDelayBetweenFollows: msDelayBetweenFollows,
  });

/**
 * @todo !!Important: check for N seconds the follow is successful.
 *  Edit. postFollowChecks dep should be good now.
 */
export const follow = (el: ElementHandle<Element>) => {
  type ErrorMessages =
    | "Follow request found"
    | "Private Profile"
    | "Profile not followed";

  const has = (text: string, errorMessage: ErrorMessages) =>
    ElementUtils.innerTextMatcher(true)(text, errorMessage);
  const hasNot = (text: string, errorMessage: ErrorMessages) =>
    ElementUtils.innerTextMatcher(false)(text, errorMessage);
  return Follow.follow({
    preFollowChecks: [
      WebDepsUtils.bringToFront,
      pipe(
        WebDepsUtils.waitFor$x(`//*`),
        WebTeer.chain(
          WebTeer.fromPredicate(
            (html) => html.length > 0,
            () => new Error("No html found pre-follow")
          )
        ),
        WebTeer.chain((html) =>
          pipe(html[0], hasNot("privato", "Private Profile"))
        )
      ),
    ],
    postFollowChecks: [
      pipe(
        {},
        WebTeer.tryNTimes<any, void>(
          2000,
          4
        )(() =>
          pipe(
            WebDepsUtils.$x(PageXPaths.followButton.clicked),
            WebTeer.chain(
              ElementUtils.isOneElementArray(
                (els, r) =>
                  `Found "${els.length}" confirm-buttons at ${r.page.url()}`
              )
            ),
            WebTeer.chain(() => WebTeer.of(undefined))
          )
        )
      ),
      /**
       * maybe he can't see the 'segui' while loading
       * NOTE: maybe is a useless check
       */
      pipe(
        el,
        WebTeer.tryNTimes<ElementHandle<Element>, undefined>(
          2000,
          4
        )(hasNot("segui", "Profile not followed"))
      ),
    ],
    clickFollowButton: ElementUtils.click(el),
    concatAll: pipe(
      WebTeer.of(undefined),
      S.concatAll(WebTeer.semigroupCheckLefts)
    ),
    chain: WebTeer.chain,
    of: WebTeer.of,
  });
};
export const followOnProfilePage = pipe(
  pipe(
    PageXPaths.followButton.toClick,
    WebDepsUtils.waitFor$x,
    WebTeer.chain(
      ElementUtils.isOneElementArray(
        (els, r) =>
          `Found "${
            els.length
          }" follow-button(s) on profile page ${r.page.url()}`
      )
    ),
    WebTeer.orElse((e) =>
      pipe(
        PageXPaths.followButton.clicked,
        WebDepsUtils.$x,
        WebTeer.chain(
          ElementUtils.isZeroElementArray(
            (els, r) =>
              `${e}\nProfile already followed. Found "${
                els.length
              }" alreadyFollow-button(s) on profile page ${r.page.url()}`
          )
        )
      )
    )
  ),
  WebTeer.chain((els) => follow(els[0]))
);
