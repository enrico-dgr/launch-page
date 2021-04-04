"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramXPaths = exports.TelegramSelectors = void 0;
exports.TelegramSelectors = {
    messageInput: "body > div.page_wrap > div.im_page_wrap.clearfix > div > div.im_history_col_wrap.noselect.im_history_loaded > div.im_history_selected_wrap > div > div.im_bottom_panel_wrap > div.im_send_panel_wrap.noselect > div > div > div > form > div.im_send_field_wrap.hasselect > div.composer_rich_textarea",
    sendMessageButton: "body > div.page_wrap > div.im_page_wrap.clearfix > div > div.im_history_col_wrap.noselect.im_history_loaded > div.im_history_selected_wrap > div > div.im_bottom_panel_wrap > div.im_send_panel_wrap.noselect > div > div > div > form > div.im_send_buttons_wrap.clearfix > button",
};
exports.TelegramXPaths = {
    chatBot: (botName) => `//a[@class='im_dialog' and contains(., '${botName}')]`,
    buttonLink: (buttonText) => `//a[@class="btn reply_markup_button" and contains(.,"${buttonText}")]`,
    buttonSkip: (skipMessage) => `//button[@class='btn reply_markup_button' and contains(.,'${skipMessage}')]`,
    messageByTextAndTime: (textMessage, time) => `//div[@class='im_message_wrap clearfix' and contains(., '${textMessage}') and .//span[contains(.,'${time}')]]`,
};
//# sourceMappingURL=NodePaths.js.map