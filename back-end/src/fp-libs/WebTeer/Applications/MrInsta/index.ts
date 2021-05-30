import { pipe } from "fp-ts/lib/function";
import * as WebTeer from "../../index";
import * as PageUtils from "../../Utils/Page";
import * as ElementUtils from "../../Utils/ElementHandle";
import { Urls } from "./Urls";
import { plansPage } from "./XPaths";
import { ElementHandle } from "puppeteer";
import { init } from "./Init";

export const initFreeFollower = pipe(Urls.base.href, (url: string) =>
  init({
    goToGrowthPlansPage: PageUtils.goto(url),
    activatePlan: pipe(
      PageUtils.waitFor$x(plansPage.freeFollower),
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
