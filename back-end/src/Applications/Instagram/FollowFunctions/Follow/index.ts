import { ElementHandle } from 'puppeteer';

import * as ElementUtils from '../../../../Utils/ElementHandle';
import * as Follow from './getFollow';
import { postFollowChecks } from './postFollowChecks';
import { preFollowChecks } from './preFollowChecks';

const follow = Follow.getFollow<ElementHandle<Element>>({
  preFollowChecks: (dtf) => preFollowChecks,
  postFollowChecks: (dtf) => postFollowChecks,
  clickFollowButton: (dtf) => ElementUtils.evaluateClick(dtf),
});
export { follow };
export * from "./getFollow";
