import P, { Page } from "puppeteer";
import * as TE from "fp-ts/TaskEither";
import * as WebTeer from "./fp-libs/WebTeer";
import {
  followedOfProfile,
  followOnProfilePage,
} from "./fp-libs/WebTeer/Applications/Instagram/index";
import { pipe } from "fp-ts/lib/function";
import { log } from "fp-ts/lib/Console";
const runAndLog = (wp: WebTeer.WebProgram<any>) =>
  pipe(
    wp,
    WebTeer.match(
      (e) =>
        log(
          `--------- --------- --------- ---------\n` +
            `Program run with error.\n` +
            `--------- Message: ${e}\n` +
            `--------- --------- --------- ---------`
        )(),
      (a) =>
        log(
          `--------- --------- --------- ---------\n` +
            `Program run to the end.\n` +
            `--------- Returned object: ${JSON.stringify(a)}\n` +
            `--------- --------- --------- ---------`
        )()
    )
  );
//waverener12
//newmener2
const instagram = {
  pages: [
    "https://www.instagram.com/unicornostrafatto/", // bad
    "https://www.instagram.com/conigliotriaco/", // working but don't know how much
    "https://www.instagram.com/fast.reve/", // good
    "https://www.instagram.com/flashgram_agency/", // good // /sr.berta/
    "https://www.instagram.com/hope.growup/",
    "https://www.instagram.com/fluojet/",
  ],
  profiles: ["https://www.instagram.com/sr.berta/"],
  myProfiles: ["waverener12", "newmener2"],
};

const PROFILE = instagram.myProfiles[0];
const INSTAGRAM_PAGE = instagram.pages[5];
/**
 * Main
 */
(async () => {
  const browser = await P.launch({
    headless: true,
    userDataDir: `./userDataDirs/folders/${PROFILE}`,
    args: ["--lang=it"],
    defaultViewport: { width: 1350, height: 768 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  const follow = pipe({ page }, runAndLog(followOnProfilePage));
  await page.goto("https://www.instagram.com/fil_black_vibes/");
  await follow();
  await page.goto("https://www.instagram.com/filippo_morari/");
  await follow();
  await page.goto("https://www.instagram.com/williamlucacosta11/");
  await follow();
})();
/**
 *
 */

const followAllFollowed = ({ page }: WebTeer.WebDeps) =>
  pipe(
    { page },
    WebTeer.fromTaskK(({ page: page_ }) => () => page_.goto(INSTAGRAM_PAGE)),
    WebTeer.chain(() => followedOfProfile(4000)),
    WebTeer.match(
      (e) => log("[Error] Follow followed of Profile finished: " + e)(),
      () => log("Follow followed of Profile finished")()
    )
  );
