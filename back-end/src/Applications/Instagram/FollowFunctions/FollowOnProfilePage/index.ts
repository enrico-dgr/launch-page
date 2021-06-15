import { follow } from "../Follow";
import { getFollowOnProfilePage } from "./getFollowOnProfilePage";
import { getDepsToFollow } from "./getDepsToFollow";

const followOnProfilePage = getFollowOnProfilePage({
  getDepsToFollow: getDepsToFollow,
  follow: follow,
});

export { followOnProfilePage };
export * from "./getFollowOnProfilePage";
