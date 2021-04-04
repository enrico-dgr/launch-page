"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const toPaths_1 = require("./toPaths");
const Winston_1 = __importDefault(require("./Winston"));
const thisLogger = Winston_1.default("Teleteer");
class Teleteer {
    constructor(page) {
        this.setupPage = (page, url, errorMessage) => __awaiter(this, void 0, void 0, function* () {
            page.setDefaultTimeout(15000);
            yield page.bringToFront().catch();
            return yield page
                .goto(url, {
                waitUntil: "load",
            })
                .catch((reason) => {
                thisLogger.error(errorMessage);
                return reason;
            });
        });
        this.init = () => __awaiter(this, void 0, void 0, function* () {
            const loginUrl = "https://web.telegram.org/#/login";
            this.setupPage(this.page, loginUrl, "Init can't load " + loginUrl);
        });
        this.checkXPath = (textToQuery, toXPath, errorMessage) => __awaiter(this, void 0, void 0, function* () {
            const xPath = toXPath(textToQuery);
            const isAvailable = yield this.page.waitForXPath(xPath);
            const promise = this.page.$x(xPath);
            if (isAvailable === null) {
                thisLogger.error(errorMessage);
            }
            return promise;
        });
        this.checkReadyXPath = (xPath, errorMessage) => __awaiter(this, void 0, void 0, function* () {
            const isAvailable = yield this.page.waitForXPath(xPath);
            const promise = this.page.$x(xPath);
            if (isAvailable === null) {
                thisLogger.error(errorMessage);
            }
            return promise;
        });
        this.checkXPathInElement = (textToQuery, elementHandle, toXPath, errorMessage) => __awaiter(this, void 0, void 0, function* () {
            const xPath = toXPath(textToQuery);
            const result = yield elementHandle.$x(xPath);
            if (result.length === 0) {
                thisLogger.error(errorMessage);
            }
            return result;
        });
        this.checkSingleMatchAndDo = (errorMessage, handle, callBackfn) => __awaiter(this, void 0, void 0, function* () {
            if (handle.length === 1) {
                yield callBackfn(handle[0]);
            }
            else {
                thisLogger.error(`Multiple results (${handle.length} results) -- ${errorMessage}`);
            }
        });
        this.checkSingleMatchAnd = {
            click: (errorMessage, handle) => __awaiter(this, void 0, void 0, function* () {
                return this.checkSingleMatchAndDo(errorMessage, handle, (handle) => handle.click());
            }),
        };
        this.getPropertyAsString = (elementHandle, propertyName) => __awaiter(this, void 0, void 0, function* () {
            return (yield elementHandle
                .getProperty(propertyName)
                .then((jshandle) => jshandle === null || jshandle === void 0 ? void 0 : jshandle.jsonValue()));
        });
        this.searchInElement = (elementHandle, text) => __awaiter(this, void 0, void 0, function* () { return (yield this.getPropertyAsString(elementHandle, "innerText")).search(text); });
        this.dialogs = (profileName) => __awaiter(this, void 0, void 0, function* () {
            return this.checkXPath(profileName, toPaths_1.ToXPath.dialogLink, `Can't find dialog with profile name: ${profileName}`);
        });
        this.openDialog = (profileName) => __awaiter(this, void 0, void 0, function* () {
            return this.checkSingleMatchAnd.click(`Dialog with profile name: ${profileName}`, yield this.dialogs(profileName));
        });
        this.message = {
            allByProfileName: (profileName) => __awaiter(this, void 0, void 0, function* () {
                return this.checkXPath(profileName, toPaths_1.ToXPath.message, `Can't find any message from: ${profileName}`);
            }),
            lastByProfileName: (profileName) => __awaiter(this, void 0, void 0, function* () {
                return this.message
                    .allByProfileName(profileName)
                    .then((messages) => messages[messages.length - 1]);
            }),
            allByProfileNameAndText: (profileName, text) => __awaiter(this, void 0, void 0, function* () {
                return this.checkReadyXPath(toPaths_1.ToXPath.messageWithText(profileName, text), `Can't find message with text: ${text}`);
            }),
            button: {
                allByProfileNameAndText: (profileName, buttonText) => __awaiter(this, void 0, void 0, function* () {
                    return this.checkReadyXPath(toPaths_1.ToXPath.inMessage.replyButton(profileName, buttonText), `Can't find message button with text: ${buttonText}`);
                }),
                btnLinkAllByProfileNameAndText: (profileName, buttonText) => __awaiter(this, void 0, void 0, function* () {
                    return this.checkReadyXPath(toPaths_1.ToXPath.inMessage.replyButtonLink(profileName, buttonText), `Can't find message button link with text: ${buttonText}`);
                }),
            },
        };
        this.bottomPanel = {
            bottomPanelButton: (buttonText) => __awaiter(this, void 0, void 0, function* () {
                return this.checkXPath(buttonText, toPaths_1.ToXPath.inBottomPanel.replyButton, `Can't find bottom panel button with text: ${buttonText}`);
            }),
            showBottomPanel: () => __awaiter(this, void 0, void 0, function* () {
                return this.checkSingleMatchAnd.click(`Bottom panel 'active composer keyboad' button`, yield this.checkXPath("", toPaths_1.ToXPath.inBottomPanel.composerKeyboardButton, ``));
            }),
            clickBottomPanelButton: (buttonText) => __awaiter(this, void 0, void 0, function* () {
                return this.checkSingleMatchAnd.click(`Bottom panel button with text: ${buttonText}`, yield this.bottomPanel.bottomPanelButton(buttonText));
            }),
            sendMessage: (text) => __awaiter(this, void 0, void 0, function* () {
                yield this.page.waitForSelector(toPaths_1.toSelector.messageInput);
                yield this.page.click(toPaths_1.toSelector.messageInput);
                const keyEnter = String.fromCharCode(13);
                yield this.page.keyboard.type(text + keyEnter, { delay: 100 });
            }),
        };
        this.page = page;
    }
}
exports.default = Teleteer;
//# sourceMappingURL=Teleteer.js.map