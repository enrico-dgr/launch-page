export const toSelector = {
  messageInput:
    "body > div.page_wrap > div.im_page_wrap.clearfix > div > div.im_history_col_wrap.noselect.im_history_loaded > div.im_history_selected_wrap > div > div.im_bottom_panel_wrap > div.im_send_panel_wrap.noselect > div > div > div > form > div.im_send_field_wrap.hasselect > div.composer_rich_textarea",
  sendMessageButton:
    "body > div.page_wrap > div.im_page_wrap.clearfix > div > div.im_history_col_wrap.noselect.im_history_loaded > div.im_history_selected_wrap > div > div.im_bottom_panel_wrap > div.im_send_panel_wrap.noselect > div > div > div > form > div.im_send_buttons_wrap.clearfix > button",
};

/**
 * @description When profileName is asked, will be prefixed a double space
 * for dialogLink and single space for other calls, like for messages
 */
export class ToXPath {
  /**
   *
   * @param profileName a double space is added before,
   * to match a double space behind the name.
   * @returns
   */
  static dialogLink = (profileName: string) =>
    `//a[@class='im_dialog' and contains(., '  ${profileName}')]`;
  static replyButtonLink = (buttonText: string) =>
    `//a[@class="btn reply_markup_button" and contains(.,"${buttonText}")]`;
  static replyButton = (buttonText: string) =>
    `//button[@class='btn reply_markup_button' and contains(.,'${buttonText}')]`;
  static instagramLink = () =>
    `//a[contains(@href,'https://www.instagram.com/stories')]`;
  static message = (profileName: string) =>
    `//div[@class='im_content_message_wrap im_message_in' and contains(., ' ${profileName}')]`;
  static messageWithText = (profileName: string, text: string) =>
    `//div[@class='im_content_message_wrap im_message_in' and contains(., ' ${profileName}')` +
    ` and contains(.,'${text}')]`;
  static inMessage = {
    replyButtonLink: (profileName: string, buttonText: string) =>
      ToXPath.message(profileName) + ToXPath.replyButtonLink(buttonText),
    replyButton: (profileName: string, buttonText: string) =>
      ToXPath.message(profileName) + ToXPath.replyButton(buttonText),
    instagramLink: (profileName: string, text: string) =>
      ToXPath.messageWithText(profileName, text) + ToXPath.instagramLink(),
  };
  private static bottomPanelPath = `//div[@class='im_bottom_panel_wrap']`;
  static inBottomPanel = {
    replyButton: (buttonText: string) =>
      ToXPath.bottomPanelPath + ToXPath.replyButton(buttonText),
    /**
     *
     * @param useless not used for now.
     * @returns
     */
    composerKeyboardButton: (useless: string) =>
      ToXPath.bottomPanelPath + `//a[@class='composer_keyboard_btn active']`,
  };
}
