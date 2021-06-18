import * as IO from 'fp-ts/IO';
import { pipe } from 'fp-ts/lib/function';
import fs from 'fs';
import path from 'path';
import { format } from 'prettier';

import { TypeOfActions } from '../';

// ------------------------------------------
//  Constants
// ------------------------------------------
const PATH_OF_CONFIRMED_JSON = path.resolve(__dirname, "./confirmed.json");
const PATH_OF_BAD_JSON = path.resolve(__dirname, "./bad.json");
// ------------------------------------------
//  Utils
// ------------------------------------------
/**
 * @name parseToFormattedJSON
 */
const parseToFormattedJSON = (object: {}) =>
  format(JSON.stringify(object), { parser: "json-stringify" });
/**
 *
 */
const confirmedJSON = () =>
  JSON.parse(fs.readFileSync(PATH_OF_CONFIRMED_JSON, "utf8")) as ReportJSON;
/**
 *
 */
const badJSON = () =>
  JSON.parse(fs.readFileSync(PATH_OF_BAD_JSON, "utf8")) as ReportJSON;
// ------------------------------------------
//  Exports
// ------------------------------------------

/**
 *
 */
export type Report = {
  href: string;
  action: TypeOfActions;
  info: {};
};

/**
 *
 */
export interface ReportJSON {
  reports: Report[];
}

/**
 *
 */
export const oldestConfirmedReport = () =>
  confirmedJSON().reports[0] ?? undefined;
/**
 *
 */
export const removeOldestConfirmedReport = () =>
  pipe(
    confirmedJSON,
    IO.chain<ReportJSON, void>((data) => () =>
      fs.writeFileSync(
        PATH_OF_CONFIRMED_JSON,
        parseToFormattedJSON({
          ...data,
          reports: [...(data.reports.slice(1) ?? [])],
        })
      )
    )
  );
/**
 *
 */
export const newConfirmedReport = (newReport: Report) =>
  pipe(
    confirmedJSON,
    IO.chain<ReportJSON, void>((data) => () =>
      fs.writeFileSync(
        PATH_OF_CONFIRMED_JSON,
        parseToFormattedJSON({
          ...data,
          reports: [...(data.reports ?? []), newReport],
        })
      )
    )
  );

/**
 *
 */
export const newBadReport = (newReport: Report) =>
  pipe(
    badJSON,
    IO.chain<ReportJSON, void>((data) => () =>
      fs.writeFileSync(
        PATH_OF_BAD_JSON,
        parseToFormattedJSON({
          ...data,
          reports: [...(data.reports ?? []), newReport],
        })
      )
    )
  );
