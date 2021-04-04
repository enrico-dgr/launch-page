"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToXPath = exports.toSelector = void 0;
exports.toSelector = {
    messageInput: "body > div.page_wrap > div.im_page_wrap.clearfix > div > div.im_history_col_wrap.noselect.im_history_loaded > div.im_history_selected_wrap > div > div.im_bottom_panel_wrap > div.im_send_panel_wrap.noselect > div > div > div > form > div.im_send_field_wrap.hasselect > div.composer_rich_textarea",
    sendMessageButton: "body > div.page_wrap > div.im_page_wrap.clearfix > div > div.im_history_col_wrap.noselect.im_history_loaded > div.im_history_selected_wrap > div > div.im_bottom_panel_wrap > div.im_send_panel_wrap.noselect > div > div > div > form > div.im_send_buttons_wrap.clearfix > button",
};
class ToXPath {
}
exports.ToXPath = ToXPath;
ToXPath.dialogLink = (profileName) => `//a[@class='im_dialog' and contains(., '${profileName}')]`;
ToXPath.replyButtonLink = (buttonText) => `//a[@class="btn reply_markup_button" and contains(.,"${buttonText}")]`;
ToXPath.replyButton = (buttonText) => `//button[@class='btn reply_markup_button' and contains(.,'${buttonText}')]`;
ToXPath.instagramLink = () => `//a[contains(@href,'https://www.instagram.com/stories')]`;
ToXPath.message = (profileName) => `//div[@class='im_content_message_wrap im_message_in' and contains(., '${profileName}')]`;
ToXPath.messageWithText = (profileName, text) => `//div[@class='im_content_message_wrap im_message_in' and contains(., '${profileName}')` +
    ` and contains(.,'${text}')]`;
ToXPath.inMessage = {
    replyButtonLink: (profileName, buttonText) => ToXPath.message(profileName) + ToXPath.replyButtonLink(buttonText),
    replyButton: (profileName, buttonText) => ToXPath.message(profileName) + ToXPath.replyButton(buttonText),
    instagramLink: (profileName, text) => ToXPath.messageWithText(profileName, text) + ToXPath.instagramLink(),
};
ToXPath.bottomPanelPath = `//div[@class='im_bottom_panel_wrap']`;
ToXPath.inBottomPanel = {
    replyButton: (buttonText) => ToXPath.bottomPanelPath + ToXPath.replyButton(buttonText),
    composerKeyboardButton: (useless) => ToXPath.bottomPanelPath + `//a[@class='composer_keyboard_btn active']`,
};
//# sourceMappingURL=toPaths.js.map