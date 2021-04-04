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
const node_fetch_1 = __importDefault(require("node-fetch"));
const postRequest = (siteReq) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield node_fetch_1.default("http://localhost:5000/api/datasaving/tabdata", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(siteReq),
    });
    return response.json();
});
class ComunicationSite {
    constructor(page, site, intervalCheck = 30000) {
        this.skips = [""];
        this.errors = [""];
        this.startDOM = () => {
            const check = () => {
                this.state = "working";
                this.skips = [""];
                this.errors = [""];
            };
            const timer = setInterval(() => {
                postRequest({
                    site: this.site,
                    state: this.state,
                    skips: this.skips,
                    errors: this.errors,
                })
                    .then((body) => {
                    check();
                    body.commands.forEach((command) => {
                        eval(command);
                    });
                })
                    .catch(() => clearInterval(timer));
            }, this.intervalCheck);
        };
        this.state = "init";
        this.page = page;
        this.site = site;
        this.intervalCheck = intervalCheck;
    }
}
exports.default = ComunicationSite;
//# sourceMappingURL=comSite.js.map