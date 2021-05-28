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
  type ErrorMessages = "Follow request found" | "Private Profile";
  const leftOnTextMatch = (text: string, errorMessage: ErrorMessages) => (
    element_inScope: ElementHandle<Element>
  ) =>
    pipe(
      ElementUtils.getProperty(element_inScope)<string>("innerText"),
      WebTeer.chain((innerText) =>
        innerText.search(text) < 0
          ? WebTeer.right(undefined)
          : WebTeer.left(new Error(errorMessage))
      )
    );
  return Follow.follow({
    preAndAfterFollowChecks: [
      leftOnTextMatch("Richiesta effettuata", "Follow request found")(el),
    ],
    preFollowChecks: [
      pipe(
        PageUtils.waitFor$x(`//*`),
        WebTeer.chain((html) =>
          html.length > 0
            ? leftOnTextMatch("privato", "Private Profile")(html[0])
            : WebTeer.right(undefined)
        )
      ),
    ],
    postFollowChecks: [WebTeer.of(undefined)],
    clickFollowButton: ElementUtils.click(el),
    chain: WebTeer.chain,
    of: WebTeer.of,
    concatAll: S.concatAll(WebTeer.semigroupCheckLefts)(WebTeer.of(undefined)),
  });
};
