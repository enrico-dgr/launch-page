import { oldClick } from "../../../../Utils/ElementHandle";
import { waitFor$x } from "../../../../Utils/WebDeps";
import { followed } from "../../XPaths/profilePage";
import { getFollowFollowedOfProfile } from "./getFollowFollowedOfProfile";
export const followedOfProfile = (msDelayBetweenFollows: number) =>
  getFollowFollowedOfProfile({
    link_XPath_OR_selector: followed.link,
    followFollowed_XPath_OR_selector: followed.follow,
    unfollowFollowed_XPath_OR_selector: followed.unfollow,
    scroller_XPath_OR_selector: followed.divUl,
    getElementHandles: waitFor$x,
    click: oldClick,
    msDelayBetweenFollows: msDelayBetweenFollows,
  });
