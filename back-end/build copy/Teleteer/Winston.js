"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const logger = (label) => winston_1.createLogger({
    format: winston_1.format.combine(winston_1.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }), winston_1.format.label({ label: label }), winston_1.format.json()),
    level: "debug",
    transports: [
        new winston_1.transports.File({
            filename: "error.log",
            level: "error",
        }),
        new winston_1.transports.File({
            filename: "info.log",
            level: "info",
        }),
        new winston_1.transports.File({
            filename: "debug.log",
            level: "debug",
        }),
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.printf(({ level, label, message, timestamp }) => `${level}, [${label}], ${timestamp} : ${message}`)),
        }),
    ],
});
exports.default = logger;
//# sourceMappingURL=Winston.js.map