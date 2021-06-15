import * as WebDepsUtils from "../../../../Utils/WebDeps";
import * as ElementUtils from "../../../../Utils/ElementHandle";
import * as WebTeer from "../../../../index";
import { pipe } from "fp-ts/lib/function";

export const preFollowChecks = [
  pipe(
    WebDepsUtils.$x(`//*[contains(.,'privato')]`),
    WebTeer.chain(
      ElementUtils.isZeroElementArray(
        (els, r) =>
          `Found "${
            els.length
          }" element(s) with XPath '//*[contains(.,'privato')]' at ${r.page.url()}`
      )
    ),
    WebTeer.chain(() => WebTeer.of(undefined))
  ),
];
