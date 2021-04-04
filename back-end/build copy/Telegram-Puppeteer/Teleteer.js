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
const Winston_1 = __importDefault(require("../Winston"));
const thisLogger = Winston_1.default("Teleteer");
class Teleteer {
    constructor(page) {
        this.init = () => __awaiter(this, void 0, void 0, function* () {
            this.page.setDefaultTimeout(15000);
            yield this.page.bringToFront();
            const loginUrl = "https://web.telegr.org/#/login";
            yield this.page
                .goto(loginUrl, {
                waitUntil: "load",
            })
                .catch(() => {
                thisLogger.error("Can't load " + loginUrl);
            });
        });
        this.openChatHistory = (profileName) => __awaiter(this, void 0, void 0, function* () {
            const chatHistoryXPaths = NodePaths_1.TelegramXPaths.chatHistoryLink(profileName);
            const isChatHistoryAvailable = yield this.page
                .waitForXPath(chatHistoryXPaths)
                .catch(() => false);
            if (!!isChatHistoryAvailable) {
                const chatsHandle = yield this.page.$x(chatHistoryXPaths);
                chatsHandle[0].click();
            }
            else
                thisLogger.error(`Can't find chat history with profile name: ${profileName}`);
        });
        this.page = page;
    }
}
exports.default = Teleteer;
//# sourceMappingURL=Teleteer.js.map