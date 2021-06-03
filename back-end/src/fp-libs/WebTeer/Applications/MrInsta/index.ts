import { flow, pipe } from "fp-ts/lib/function";
import * as WebTeer from "../../index";
import * as Instagram from "../Instagram";
import * as WebDepsUtils from "../../Utils/WebDeps";
import * as ElementUtils from "../../Utils/ElementHandle";
import { UrlsMI, UrlsTM } from "./Urls";
import { freeFollower, plansPage } from "./XPaths";
import { Page } from "puppeteer";
import { init } from "./Init";
import { routine } from "./Routine";
import { plan } from "./Plan";
type SocialPlatform = "MrInsta" | "TurboMedia";
const getBaseUrl = (socialPlatform: SocialPlatform): string => {
  switch (socialPlatform) {
    case "MrInsta":
      return UrlsMI.base.href;

    case "TurboMedia":
      return UrlsTM.base.href;
  }
};
export const initFreeFollower = flow(getBaseUrl, (url: string) =>
  init({
    goToGrowthPlansPage: WebDepsUtils.goto(url),
    activatePlan: pipe(
      WebDepsUtils.waitFor$x(plansPage.freeFollower),
      WebTeer.chain(
        ElementUtils.isOneElementArray(
          (els, r) =>
            `Found "${
              els.length
            }" activateFreeFollowersPlan-button(s) on page ${r.page.url()}.\n` +
            `Expected page: ${url}`
        )
      ),
      WebTeer.chain((els) => ElementUtils.click(els[0]))
    ),
  })
);
/**
 *
 */
export const routineFreeFollower = routine<Page>({
  retrieveProfile: pipe(
    WebDepsUtils.waitFor$x(freeFollower.followProfileButton),
    WebTeer.chain(
      ElementUtils.isOneElementArray(
        (els, r) => `Found "${els.length}" profile-links at ${r.page.url()}`
      )
    ),
    WebTeer.chain((els) => pipe(els[0], ElementUtils.getHref)),
    WebTeer.chain(WebDepsUtils.openNewPageToUrl)
  ),
  follow: (p) =>
    pipe(
      WebTeer.ask(),
      WebTeer.chainTaskEitherK((r) =>
        pipe({ ...r, page: p }, Instagram.Follow.followOnProfilePage)
      )
    ),
  confirm: pipe(
    WebDepsUtils.closeOtherPages,
    WebTeer.chain(() => WebDepsUtils.waitFor$x(freeFollower.confirmButton)),
    WebTeer.chain(
      ElementUtils.isOneElementArray(
        (els, r) => `Found "${els.length}" confirm-buttons at ${r.page.url()}`
      )
    ),
    WebTeer.chain((els) => ElementUtils.click(els[0]))
  ),
  preRetrieveChecks: [
    pipe(
      WebTeer.of(undefined),
      WebTeer.chainNOrElse<void, void>(
        1000,
        18
      )(() =>
        pipe(
          WebDepsUtils.$x(`//*[contains(.,'Processing')]`),
          WebTeer.chain(
            ElementUtils.isZeroElementArray(
              (els, r) =>
                `Found "${els.length}" processing-text at ${r.page.url()}`
            )
          ),
          WebTeer.chain(() => WebTeer.of(undefined))
        )
      )
    ),
    WebTeer.delay<void>(2000)(undefined),
  ],
  /**
   *
   */
  skip: pipe(
    WebDepsUtils.closeOtherPages,
    WebTeer.chainFirst(WebTeer.delay(1000)),
    WebTeer.chain(() => WebDepsUtils.bringToFront),
    WebTeer.chainNOrElse<void, void>(
      1000,
      5
    )(() =>
      pipe(
        WebDepsUtils.$x(`//*//a[contains(.,'Skip')]`),
        WebTeer.chain(
          ElementUtils.isOneElementArray(
            (els, r) => `Found "${els.length}" skip-button at ${r.page.url()}`
          )
        ),
        WebTeer.chain((els) => ElementUtils.click(els[0])),
        WebTeer.chain(() => WebTeer.of(undefined))
      )
    )
  ),
});
/**
 *
 * @param socialPlatform
 * @returns
 */
export const freeFollowerPlan = (socialPlatform: SocialPlatform) =>
  plan({
    init: initFreeFollower(socialPlatform),
    routine: routineFreeFollower,
    end: pipe(
      WebTeer.of(undefined),
      WebTeer.chainNOrElse<undefined, void>(
        1000,
        60
      )(() =>
        pipe(
          WebDepsUtils.$x(`//button[text()='Validate']`),
          WebTeer.chain(
            ElementUtils.isOneElementArray(
              (els, r) =>
                `Found "${els.length}" validate-button at ${r.page.url()}`
            )
          ),
          WebTeer.chain((els) => ElementUtils.click(els[0])),
          WebTeer.chain(() => WebTeer.of(undefined))
        )
      )
    ),
  });
