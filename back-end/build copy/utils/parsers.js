"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramUrlToHttpUrl = void 0;
const telegramUrlToHttpUrl = (telegramUrl) => {
    const httpsPosition = telegramUrl.search("http");
    const urlToParse = telegramUrl.slice(httpsPosition);
    const urlToParseWithDots = urlToParse.replace("%3A", ":");
    const urlParsed = urlToParseWithDots.replace(/%2F/g, "/");
    return urlParsed;
};
exports.telegramUrlToHttpUrl = telegramUrlToHttpUrl;
//# sourceMappingURL=parsers.js.map