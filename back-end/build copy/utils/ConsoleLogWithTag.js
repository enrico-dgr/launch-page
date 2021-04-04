"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConsoleLogWithTag {
    constructor(tag) {
        this.log = (msg) => console.log(this.tag + msg);
        this.tag = tag;
    }
}
exports.default = ConsoleLogWithTag;
//# sourceMappingURL=ConsoleLogWithTag.js.map