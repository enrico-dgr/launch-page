import { pipe } from "fp-ts/lib/function";
import * as WebTeer from "../../index";
import * as Instagram from "../Instagram";
import * as WebDepsUtils from "../../Utils/WebDeps";
import * as PageUtils from "../../Utils/Page";
import * as ElementUtils from "../../Utils/ElementHandle";
import { Urls } from "./Urls";
import { freeFollower, plansPage } from "./XPaths";
import { Page } from "puppeteer";
import { init } from "./Init";
import { routine } from "./Routine";

export const initFreeFollower = pipe(Urls.base.href, (url: string) =>
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
    chain: WebTeer.chain,
  })
);
/**
 *
 * @todo !!Important: check for N seconds the confirm is ended before start again the routine
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
        pipe({ ...r, page: p }, Instagram.followOnProfilePage)
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
  chain: WebTeer.chain,
});
