export class ToSelector {
  static dislikeButton = `section > span > button > div > span > svg[aria-label="Non mi piace più"]`;
  static likeButton = `section > span > button > div > span > svg[aria-label="Mi piace"]`;
}

export class ToXPath {
  static followButton = {
    publicProfile: "//div[1]/div[1]/div/div/div/span/span[1]/button",
    privateProfile: `//section/div[1]/div[1]/div/div/button`,
    officialProfile: `//section/div[2]/div/div/div/div/span/span[1]/button`,
  };
  static stories = {
    container: `//section/div[1]/div/section/div/div[2]`,
    watch_asButton: `//section/div/div[1]/div/div/div/div[3]/button`,
  };
}
