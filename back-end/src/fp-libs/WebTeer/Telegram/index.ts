import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { ElementHandle } from "puppeteer";
import { WebDeps } from "..";

const profilePageXPaths = {};

const Urls = {
  base: new URL("https://web.telegram.org/"),
};
