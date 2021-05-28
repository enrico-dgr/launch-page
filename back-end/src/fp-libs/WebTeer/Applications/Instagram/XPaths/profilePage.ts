export const followed = {
  link: `//a[@class='-nal3 ' and contains(.,' profili seguiti')]`,
  follow: `//ul/div/li/div/div/button[text()='Segui']`,
  unfollow: `//ul/div/li/div/div/button[text()='Segui già']`,
  ul: `//ul[./div/li/div/div/button[contains(.,'Segui')]]`,
  divUl: `//div[./ul/div/li/div/div/button[contains(.,'Segui')]]`,
};
export const followButton = {
  public: `//div[1]/div[1]/div/div/div/span/span[1]/button[contains(.,'Segui')]`,
  private: `//section/div/div/div/div/button[contains(.,'Segui')]`,
  official: `//section/div/div/div/div/div/span/span/button[contains(.,'Segui')]`,
  already: `//button[./div/span[@aria-label='Segui già']]`,
};
