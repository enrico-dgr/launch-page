import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import { Page } from 'puppeteer';

import * as WebDepsUtils from '../../dependencies';
import * as ElementUtils from '../../elementHandle';
import * as WT from '../../index';
import * as Instagram from '../Instagram';
import { init } from './Init';
import { plan } from './Plan';
import { routine } from './Routine';
import { UrlsMI, UrlsTM } from './Urls';
import { freeFollower, plansPage } from './XPaths';

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
      WT.chain(
        ElementUtils.isOneElementArray(
          (els, r) =>
            `Found "${
              els.length
            }" activateFreeFollowersPlan-button(s) on page ${r.page.url()}.\n` +
            `Expected page: ${url}`
        )
      ),
      WT.chain((els) => ElementUtils.evaluateClick(els[0]))
    ),
  })
);
/**
 *
 */
export const routineFreeFollower = routine<Page>({
  retrieveProfile: pipe(
    WebDepsUtils.waitFor$x(freeFollower.followProfileButton),
    WT.chain(
      ElementUtils.isOneElementArray(
        (els, r) => `Found "${els.length}" profile-links at ${r.page.url()}`
      )
    ),
    WT.chain((els) => pipe(els[0], ElementUtils.getHref)),
    WT.chain(
      O.match(() => WT.leftAny(`No profile-link href in MrInsta/index`), WT.of)
    ),
    WT.chain(WebDepsUtils.openNewPageToUrl)
  ),
  follow: (p) =>
    pipe(
      WT.ask(),
      WT.chainTaskEitherK((r) =>
        pipe({ ...r, page: p }, Instagram.Follow.followOnProfilePage)
      )
    ),
  confirm: pipe(
    WebDepsUtils.closeOtherPages,
    WT.chain(() => WebDepsUtils.waitFor$x(freeFollower.confirmButton)),
    WT.chain(
      ElementUtils.isOneElementArray(
        (els, r) => `Found "${els.length}" confirm-buttons at ${r.page.url()}`
      )
    ),
    WT.chain((els) => ElementUtils.evaluateClick(els[0]))
  ),
  preRetrieveChecks: [
    pipe(
      WT.of(undefined),
      WT.chainNOrElse<void, void>(
        1000,
        18
      )(() =>
        pipe(
          WebDepsUtils.$x(`//*[contains(.,'Processing')]`),
          WT.chain(
            ElementUtils.isZeroElementArray(
              (els, r) =>
                `Found "${els.length}" processing-text at ${r.page.url()}`
            )
          ),
          WT.chain(() => WT.of(undefined))
        )
      )
    ),
    WT.delay<void>(2000)(undefined),
  ],
  /**
   *
   */
  skip: pipe(
    WebDepsUtils.closeOtherPages,
    WT.chainFirst(WT.delay(1000)),
    WT.chain(() => WebDepsUtils.bringToFront),
    WT.chainNOrElse<void, void>(
      1000,
      5
    )(() =>
      pipe(
        WebDepsUtils.$x(`//*//a[contains(.,'Skip')]`),
        WT.chain(
          ElementUtils.isOneElementArray(
            (els, r) => `Found "${els.length}" skip-button at ${r.page.url()}`
          )
        ),
        WT.chain((els) => ElementUtils.evaluateClick(els[0])),
        WT.chain(() => WT.of(undefined))
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
      WT.of(undefined),
      WT.chainNOrElse<undefined, void>(
        1000,
        60
      )(() =>
        pipe(
          WebDepsUtils.$x(`//button[text()='Validate']`),
          WT.chain(
            ElementUtils.isOneElementArray(
              (els, r) =>
                `Found "${els.length}" validate-button at ${r.page.url()}`
            )
          ),
          WT.chain((els) => ElementUtils.evaluateClick(els[0])),
          WT.chain(() => WT.of(undefined))
        )
      )
    ),
  });