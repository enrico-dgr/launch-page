import * as IO from 'fp-ts/IO';
import { pipe } from 'fp-ts/lib/function';
import fs from 'fs';
import path from 'path';
import { format } from 'prettier';
import { variables } from 'WebTeer/localCode/nodeVariablesForPuppeteer';

import { TypeOfActions } from '../';

// ------------------------------------------
//  Constants
// ------------------------------------------
const user = variables("--user")();
const PATH_OF_CONFIRMED_JSON = path.resolve(
  __dirname,
  `./${user}/confirmed.json`
);
const PATH_OF_BAD_JSON = path.resolve(__dirname, `./${user}/bad.json`);
const PATH_OF_SKIP_JSON = path.resolve(__dirname, `./${user}/skip.json`);
// ------------------------------------------
//  Utils
// ------------------------------------------
/**
 * @name parseToFormattedJSON
 */
const parseToFormattedJSON = (reportJSON: ReportJSON) =>
  format(JSON.stringify(reportJSON), { parser: "json-stringify" });

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

/**
 *
 */
const skipJSON = () =>
  JSON.parse(fs.readFileSync(PATH_OF_SKIP_JSON, "utf8")) as ReportJSON;

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
  counter: number;
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
          counter: data.counter + 1,
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
          counter: data.counter + 1,
          reports: [...(data.reports ?? []), newReport],
        })
      )
    )
  );
/**
 *
 */
export const newSkipReport = (newReport: Report) =>
  pipe(
    skipJSON,
    IO.chain<ReportJSON, void>((data) => () =>
      fs.writeFileSync(
        PATH_OF_SKIP_JSON,
        parseToFormattedJSON({
          ...data,
          counter: data.counter + 1,
          reports: [...(data.reports ?? []), newReport],
        })
      )
    )
  );
