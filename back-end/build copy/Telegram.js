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
const NodePaths_1 = require("./NodePaths");
const ConsoleLogWithTag_1 = __importDefault(require("./utils/ConsoleLogWithTag"));
const parsers_1 = require("./utils/parsers");
class Telegram {
    constructor(page, linkPage, BOT_NAME, BUTTON_LINK_TEXT, SKIP_MESSAGE) {
        this.sameLinkCounter = 0;
        this.sameLinkCounterReducer = (actionType) => {
            switch (actionType) {
                case "reset":
                    this.sameLinkCounter = 0;
                    break;
                case "add":
                    this.sameLinkCounter++;
                    break;
                default:
                    break;
            }
        };
        this.counterMaxOldUrl = 25;
        this.counterMaxNoAds = 40;
        this.init = () => __awaiter(this, void 0, void 0, function* () {
            const startBotTag = new ConsoleLogWithTag_1.default("startBot function: ");
            startBotTag.log("starting bot...");
            yield this.page.bringToFront();
            yield this.page.goto("https://web.telegram.org/#/login", {
                waitUntil: "load",
            });
            startBotTag.log("Page loaded");
            yield this.openTelegramChat();
            yield this.page.waitForNavigation();
            yield this.writeVisit();
            startBotTag.log("bot started");
        });
        this.openTelegramChat = () => __awaiter(this, void 0, void 0, function* () {
            const openTelegramChatTag = new ConsoleLogWithTag_1.default("openTelegramChat function: ");
            yield this.page.waitForXPath(NodePaths_1.TelegramXPaths.chatBot(this.BOT_NAME));
            const chatsHandle = this.page.$x(NodePaths_1.TelegramXPaths.chatBot(this.BOT_NAME));
            chatsHandle.then((chats) => chats[0].click());
            openTelegramChatTag.log("Chat opened");
        });
        this.writeVisit = () => __awaiter(this, void 0, void 0, function* () {
            const writeVisitTag = new ConsoleLogWithTag_1.default("writeVisit function: ");
            yield this.page.waitForSelector(NodePaths_1.TelegramSelectors.messageInput);
            yield this.page.click(NodePaths_1.TelegramSelectors.messageInput);
            const keyEnter = String.fromCharCode(13);
            yield this.page.keyboard.type("/visit" + keyEnter);
            writeVisitTag.log("/visit written");
        });
        this.botRoutine = (interval) => setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const urlToOpen = yield this.findLastLink();
            if (urlToOpen !== "Old Url" && urlToOpen !== "No Url") {
                yield this.pageForUrlToOpen.goto(urlToOpen.parsedUrl);
                yield this.pageForUrlToOpen.bringToFront();
                console.log("loading page");
            }
            else {
                console.log(urlToOpen);
                console.log(this.sameLinkCounter);
                const isThereNewAd = yield this.isNewAdAvailable();
                if (isThereNewAd === "No message") {
                    console.log(isThereNewAd);
                    return;
                }
                if (isThereNewAd && this.sameLinkCounter >= this.counterMaxOldUrl) {
                    yield this.clickSkipButton();
                    this.sameLinkCounterReducer("reset");
                }
                else if (isThereNewAd === false &&
                    this.sameLinkCounter >= this.counterMaxNoAds) {
                    yield this.writeVisit();
                    this.sameLinkCounterReducer("reset");
                }
            }
        }), interval);
        this.findLastLink = () => __awaiter(this, void 0, void 0, function* () {
            const findLastLinkTag = new ConsoleLogWithTag_1.default("findLastLink function: ");
            this.sameLinkCounterReducer("add");
            const aHandle = yield this.page
                .$x(NodePaths_1.TelegramXPaths.buttonLink(this.BUTTON_LINK_TEXT))
                .then((links) => links[links.length - 1]);
            if (!aHandle) {
                return "No Url";
            }
            const urlToParse = yield aHandle
                .getProperty("href")
                .then((hrefHandle) => hrefHandle === null || hrefHandle === void 0 ? void 0 : hrefHandle.jsonValue().then((href) => href));
            if (!urlToParse) {
                return "No Url";
            }
            findLastLinkTag.log(urlToParse);
            const parsedUrl = parsers_1.telegramUrlToHttpUrl(urlToParse);
            findLastLinkTag.log(parsedUrl);
            if (this.previousParsedUrl === parsedUrl) {
                return "Old Url";
            }
            else {
                this.previousParsedUrl = parsedUrl;
                this.sameLinkCounterReducer("reset");
                return { urlToParse, parsedUrl };
            }
        });
        this.clickSkipButton = () => __awaiter(this, void 0, void 0, function* () {
            yield this.page.waitForXPath(NodePaths_1.TelegramXPaths.buttonSkip(this.SKIP_MESSAGE));
            yield this.page
                .$x(NodePaths_1.TelegramXPaths.buttonSkip(this.SKIP_MESSAGE))
                .then((buttons) => buttons[buttons.length - 1].click());
        });
        this.isNewAdAvailable = () => __awaiter(this, void 0, void 0, function* () {
            const isNewAdAvailableTag = new ConsoleLogWithTag_1.default("isNewAdAvailable function: ");
            yield this.page.waitForXPath(`//div[@class='im_message_text']`);
            const innerText = yield this.page
                .$x(`//div[@class='im_message_text']`)
                .then((divs) => divs[divs.length - 1].getProperty("innerText"))
                .then((innterTextHandle) => innterTextHandle === null || innterTextHandle === void 0 ? void 0 : innterTextHandle.jsonValue().then((innerText) => innerText));
            if (!innerText) {
                return "No message";
            }
            if (innerText.search("Sorry, there are no new ads available.") > -1 ||
                innerText.search("Sorry, that task is no longer valid") > -1) {
                isNewAdAvailableTag.log("No ads available");
                return false;
            }
            else
                return true;
        });
        this.page = page;
        this.pageForUrlToOpen = linkPage;
        this.previousParsedUrl = "";
        this.BOT_NAME = BOT_NAME;
        this.BUTTON_LINK_TEXT = BUTTON_LINK_TEXT;
        this.SKIP_MESSAGE = SKIP_MESSAGE;
    }
}
exports.default = Telegram;
//# sourceMappingURL=Telegram.js.map