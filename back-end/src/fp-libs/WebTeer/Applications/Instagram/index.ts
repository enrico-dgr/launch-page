import * as PageUtils from "../../Utils/Page";
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
    getElementHandles: PageUtils.waitFor$x,
    click: ElementUtils.oldClick,
    msDelayBetweenFollows: msDelayBetweenFollows,
  });

/**
 * @todo select checks through options
 */
export const follow = (el: ElementHandle<Element>) => {
  type ErrorMessages =
    | "Follow request found"
    | "Private Profile"
    | "Profile not followed";
  const innerTextMatcher = (has: boolean) => (
    text: string,
    errorMessage: ErrorMessages
  ) => (this_el: ElementHandle<Element>) =>
    pipe(
      ElementUtils.getProperty(this_el)<string>("innerText"),
      WebTeer.chain(
        WebTeer.fromPredicate(
          (innerText) => (innerText.search(text) > -1 ? has : !has),
          () => new Error(errorMessage)
        )
      ),
      WebTeer.chain(() => WebTeer.of(undefined))
    );
  const has = innerTextMatcher(true);
  const hasNot = innerTextMatcher(false);
  return Follow.follow({
    preFollowChecks: [
      pipe(
        PageUtils.waitFor$x(`//*`),
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
    postFollowChecks: [pipe(el, hasNot("segui", "Profile not followed"))],
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
  WebTeer.ask(),
  WebTeer.chain(({ page }) =>
    pipe(
      PageXPaths.followButton.toClick,
      PageUtils.waitFor$x,
      WebTeer.chain(
        WebTeer.fromPredicate(
          (els) => els.length === 1,
          (els) =>
            new Error(
              `Found "${
                els.length
              }" follow-button(s) on profile page ${page.url()}`
            )
        )
      ),
      WebTeer.orElse((e) =>
        pipe(
          PageXPaths.followButton.clicked,
          PageUtils.$x,
          WebTeer.chain(
            WebTeer.fromPredicate(
              (els) => els.length === 0,
              (els) =>
                new Error(
                  `${e}\nProfile already followed. Found "${
                    els.length
                  }" alreadyFollow-button(s) on profile page ${page.url()}`
                )
            )
          )
        )
      )
    )
  ),
  WebTeer.chain((els) => follow(els[0]))
);
