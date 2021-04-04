export const TelegramSelectors = {
  messageInput:
    "body > div.page_wrap > div.im_page_wrap.clearfix > div > div.im_history_col_wrap.noselect.im_history_loaded > div.im_history_selected_wrap > div > div.im_bottom_panel_wrap > div.im_send_panel_wrap.noselect > div > div > div > form > div.im_send_field_wrap.hasselect > div.composer_rich_textarea",
  sendMessageButton:
    "body > div.page_wrap > div.im_page_wrap.clearfix > div > div.im_history_col_wrap.noselect.im_history_loaded > div.im_history_selected_wrap > div > div.im_bottom_panel_wrap > div.im_send_panel_wrap.noselect > div > div > div > form > div.im_send_buttons_wrap.clearfix > button",
};
export const TelegramXPaths = {
  chatBot: (botName: string) =>
    `//a[@class='im_dialog' and contains(., '${botName}')]`,
  buttonLink: (buttonText: string) =>
    `//a[@class="btn reply_markup_button" and contains(.,"${buttonText}")]`,
  buttonSkip: (skipMessage: string) =>
    `//button[@class='btn reply_markup_button' and contains(.,'${skipMessage}')]`,
  /**
   *
   * @param textMessage text found in the whole div, time included, but it's
   * recommended to look for the message text.
   * @param time format is hour:minute:second, example 15:50:25.
   * The less info, the more results the xPath will return.
   * @returns The xPath of the div containing that message.
   * @description It is intended to have the global message div.
   */
  messageByTextAndTime: (textMessage: string, time: string) =>
    `//div[@class='im_message_wrap clearfix' and contains(., '${textMessage}') and .//span[contains(.,'${time}')]]`,
};
