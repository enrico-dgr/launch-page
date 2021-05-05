export class ToSelector {
  static dislikeButton = `section > span > button > div > span > svg[aria-label="Non mi piace più"]`;
  static likeButton = `section > span > button > div > span > svg[aria-label="Mi piace"]`;
  static stories = {
    container: `section > div > div.Igw0E.IwRSH.eGOV_._4EzTm.NUiEW > div > div`,
  };
}

export class ToXPath {
  static notAvailablePage = `//*[contains(.,'Spiacenti, questa pagina non è disponibile')]`;
  static profileProperties = {
    private: `//*[contains(.,"Questo account è privato")]`,
  };
  static followButton = {
    publicProfile: `//div[1]/div[1]/div/div/div/span/span[1]/button[contains(.,'Segui')]`,
    privateProfile: `//section/div/div/div/div/button[contains(.,'Segui')]`,
    officialProfile: `//section/div/div/div/div/div/span/span/button[contains(.,'Segui')]`,
    alreadyFollowed: `//button[./div/span[@aria-label='Segui già']]`,
  };
  static stories = {
    container: `//section/div[1]/div/section/div/div`,

    watch_asButton: `//button[contains(.,'Visualizza la storia')]`,
  };
  static likeButton = `//section/span/button[./div/span/*[name()='svg' and @aria-label='Mi piace']]`;
  static commentTextarea = `//textarea[@aria-label='Aggiungi un commento...']`;
  static dislikeButton = `//section/span/button[./div/span/*[name()='svg' and @aria-label='Non mi piace più']]`;
  static profilePostsButtonLink = `//a[./*[name()='span']/*[name()='svg' and @aria-label='Post'] and contains(.,'Post')]`;
  static profilePostedPhotos = `//div[@class='KL4Bh']/img`;
}
