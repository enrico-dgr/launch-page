import { createLogger, format, transport, transports } from "winston";

const logger = (label: string) =>
  createLogger({
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.label({ label: label }),
      format.json()
    ),
    level: "debug",
    transports: [
      new transports.File({
        filename: "error.log",
        level: "error",
      }),
      new transports.File({
        filename: "info.log",
        level: "info",
      }),
      new transports.File({
        filename: "debug.log",
        level: "debug",
      }),
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(
            ({ level, label, message, timestamp }) =>
              `${level}, [${label}], ${timestamp} : ${message}`
          )
        ),
      }),
    ],
  });

export default logger;
