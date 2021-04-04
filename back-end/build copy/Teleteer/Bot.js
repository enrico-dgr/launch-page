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
const Teleteer_1 = __importDefault(require("./Teleteer"));
const parsers_1 = require("./parsers");
const winston_1 = require("winston");
const Winston_1 = __importDefault(require("./Winston"));
const toPaths_1 = require("./toPaths");
const thisLogger = Winston_1.default("Socialgift");
thisLogger.add(new winston_1.transports.File({
    filename: "follows.log",
    level: "silly",
}));
class Bot extends Teleteer_1.default {
    constructor(page, igPage) {
        super(page);
        this.working = false;
        this.goToIgPage = (url) => __awaiter(this, void 0, void 0, function* () {
            yield this.igPage.bringToFront();
            return yield this.igPage
                .goto(url, {
                waitUntil: "networkidle0",
            })
                .catch((reason) => {
                thisLogger.error(`Can't load ${url}`);
                return reason;
            });
        });
        this.initBot = () => __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            this.igPage.setDefaultTimeout(15000);
            yield this.openDialog(this.profileName);
        });
        this.campaignUrl = () => __awaiter(this, void 0, void 0, function* () {
            const buttonLinks = yield this.message.button.btnLinkAllByProfileNameAndText(this.profileName, this.campaignButtonLink);
            return yield this.getPropertyAsString(buttonLinks[buttonLinks.length - 1], "href");
        });
        this.campaignUrlStories = () => __awaiter(this, void 0, void 0, function* () {
            const storiesUrl = yield this.checkReadyXPath(toPaths_1.ToXPath.inMessage.instagramLink(this.profileName, "Partecipa alla Campagna"), "No stories url");
            return yield this.getPropertyAsString(storiesUrl[storiesUrl.length - 1], "href");
        });
        this.checkLike = () => __awaiter(this, void 0, void 0, function* () {
            return this.igPage
                .waitForSelector(`section > span > button > div > span > svg[aria-label="Non mi piace più"]`)
                .then(() => thisLogger.debug("Already liked"))
                .then(() => true);
        });
        this.clickLike = () => __awaiter(this, void 0, void 0, function* () {
            const likeSelector = `section > span > button > div > span > svg[aria-label="Mi piace"]`;
            return yield this.igPage
                .waitForSelector(likeSelector)
                .then((likeButton) => likeButton === null || likeButton === void 0 ? void 0 : likeButton.click())
                .then(() => true)
                .catch(() => this.checkLike().catch(() => `Can't click like`));
        });
        this.checkPrivateFollow = () => __awaiter(this, void 0, void 0, function* () {
            return this.igPage
                .waitForXPath(`//section/div[1]/div[1]/div/div/button`)
                .then(() => thisLogger.debug("private"))
                .then(() => true);
        });
        this.clickFollow = () => __awaiter(this, void 0, void 0, function* () {
            return yield this.igPage
                .waitForXPath("//div[1]/div[1]/div/div/div/span/span[1]/button")
                .then((followButton) => followButton === null || followButton === void 0 ? void 0 : followButton.click())
                .then(() => true)
                .catch(() => this.checkPrivateFollow().catch(() => `Can't click follow`));
        });
        this.visualizeStories = () => __awaiter(this, void 0, void 0, function* () {
            return yield this.igPage
                .waitForXPath(`//section/div[1]/div/section/div/div[2]`)
                .then(() => this.igPage
                .$x(`//section/div/div[1]/div/div/div/div[3]/button`)
                .then((buttons) => buttons[0]
                .click()
                .catch(() => thisLogger.debug("No story permission asked."))))
                .then(() => this.igPage.waitForTimeout(15 * 1000))
                .then(() => true)
                .catch(() => `No story to visualize`);
        });
        this.confirmCampaign = () => __awaiter(this, void 0, void 0, function* () {
            yield this.page.bringToFront();
            const buttons = yield this.message.button.allByProfileNameAndText(this.profileName, this.campaignButtonConfirm);
            buttons[buttons.length - 1].click();
        });
        this.skipCampaign = () => __awaiter(this, void 0, void 0, function* () {
            yield this.page.bringToFront();
            const buttons = yield this.message.button.allByProfileNameAndText(this.profileName, this.campaignButtonSkip);
            buttons[buttons.length - 1].click();
        });
        this.existButtons = () => __awaiter(this, void 0, void 0, function* () {
            yield this.igPage.waitForXPath(`//button`);
            yield this.igPage
                .$x(`//button`)
                .then((buttons) => __awaiter(this, void 0, void 0, function* () {
                buttons.map((button) => __awaiter(this, void 0, void 0, function* () {
                    if ((yield button.evaluate((btn) => { var _a; return (_a = btn.parentElement) === null || _a === void 0 ? void 0 : _a.tagName; })) === "SPAN" &&
                        (yield button.evaluate((btn) => { var _a, _b; return (_b = (_a = btn.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.tagName; })) === "SECTION" &&
                        (yield button.evaluate((btn) => { var _a; return (_a = btn.firstElementChild) === null || _a === void 0 ? void 0 : _a.tagName; })) === "DIV" &&
                        (yield button.evaluate((btn) => { var _a, _b; return (_b = (_a = btn.firstElementChild) === null || _a === void 0 ? void 0 : _a.firstElementChild) === null || _b === void 0 ? void 0 : _b.tagName; })) === "SPAN") {
                        thisLogger.debug(yield button.evaluate((btn) => {
                            var _a, _b, _c, _d, _e, _f;
                            return `${(_c = (_b = (_a = btn.firstElementChild) === null || _a === void 0 ? void 0 : _a.firstElementChild) === null || _b === void 0 ? void 0 : _b.firstElementChild) === null || _c === void 0 ? void 0 : _c.tagName}` +
                                `[aria-label='${(_f = (_e = (_d = btn.firstElementChild) === null || _d === void 0 ? void 0 : _d.firstElementChild) === null || _e === void 0 ? void 0 : _e.firstElementChild) === null || _f === void 0 ? void 0 : _f.getAttribute("aria-label")}']`;
                        }));
                    }
                }));
            }))
                .catch(() => thisLogger.error(`Can't load any like-button`));
        });
        this.doCampaign = (messageHandle) => __awaiter(this, void 0, void 0, function* () {
            const parsedUrl = parsers_1.telegramUrlToHttpUrl(yield this.campaignUrl().catch(() => this.campaignUrlStories()));
            yield this.goToIgPage(parsedUrl);
            var result = false;
            if ((yield this.searchInElement(messageHandle, "Lascia un LIKE")) > -1) {
                thisLogger.info("like");
                result = yield this.clickLike();
                if (result === true)
                    thisLogger.info(parsedUrl);
            }
            else if ((yield this.searchInElement(messageHandle, " Segui il Profilo")) > -1) {
                thisLogger.info("follow");
                result = yield this.clickFollow();
                if (result === true)
                    thisLogger.info(parsedUrl);
            }
            else if ((yield this.searchInElement(messageHandle, "Commento")) > -1) {
                yield this.skipCampaign();
            }
            else if ((yield this.searchInElement(messageHandle, "Visualizza Stories")) > -1) {
                thisLogger.info("story");
                result = yield this.visualizeStories();
                if (result === true)
                    thisLogger.info(parsedUrl);
            }
            else {
                yield this.skipCampaign();
                thisLogger.info("skip", {
                    text: this.getPropertyAsString(messageHandle, "innerText"),
                });
                return;
            }
            if (result === true) {
                yield this.confirmCampaign()
                    .then(() => thisLogger.debug("confirmed"))
                    .catch(() => thisLogger.error("failed to confirm"));
            }
            else if (typeof result === "string") {
                thisLogger.error(result, { link: parsedUrl });
                yield this.skipCampaign();
            }
            else
                thisLogger.error("No operation run");
        });
        this.campaignInLastFive = () => __awaiter(this, void 0, void 0, function* () {
            const messages = (yield this.message.allByProfileName(this.profileName)).slice(-5);
            for (let i = messages.length - 1; i > -1; i--) {
                if ((yield this.searchInElement(messages[i], "Partecipa alla Campagna")) >
                    -1) {
                    return messages[i];
                }
            }
        });
        this.routineBot = () => __awaiter(this, void 0, void 0, function* () {
            if (this.working === false) {
                this.working = true;
                const lastCampaign = yield this.campaignInLastFive();
                if (lastCampaign !== undefined) {
                    yield this.doCampaign(lastCampaign);
                }
                else {
                    yield this.bottomPanel.sendMessage(this.campaignButtonBottom);
                }
                this.working = false;
                return;
            }
        });
        this.startBot = () => __awaiter(this, void 0, void 0, function* () {
            yield this.initBot();
            yield this.routineBot();
            const timer = setInterval(this.routineBot, 6 * 60000);
        });
        this.profileName = "Socialgift";
        this.campaignButtonLink = "PARTECIPA";
        this.campaignButtonBottom = "🤑 GUADAGNA 🤑";
        this.campaignButtonConfirm = "CONFERMA";
        this.campaignButtonSkip = "SALTA";
        this.igPage = igPage;
    }
}
exports.default = Bot;
//# sourceMappingURL=Bot.js.map