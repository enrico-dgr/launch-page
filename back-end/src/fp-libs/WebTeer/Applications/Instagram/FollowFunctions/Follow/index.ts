import * as Follow from "./getFollow";
import * as ElementUtils from "../../../../Utils/ElementHandle";
import { ElementHandle } from "puppeteer";
import { preFollowChecks } from "./preFollowChecks";
import { postFollowChecks } from "./postFollowChecks";

const follow = Follow.getFollow<ElementHandle<Element>>({
  preFollowChecks: (dtf) => preFollowChecks,
  postFollowChecks: (dtf) => postFollowChecks,
  clickFollowButton: (dtf) => ElementUtils.click(dtf),
});
export { follow };
export * from "./getFollow";
