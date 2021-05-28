// upfollow.it
import P from "puppeteer";
import * as TE from "fp-ts/TaskEither";

import { followedOfProfile } from "./fp-libs/WebTeer/Applications/Instagram/index";
import { pipe } from "fp-ts/lib/function";
import { log } from "fp-ts/lib/Console";
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

const PROFILE = instagram.myProfiles[1];
const INSTAGRAM_PAGE = instagram.pages[5];
(async () => {
  const browser = await P.launch({
    headless: false,
    userDataDir: `./userDataDirs/folders/${PROFILE}`,
    args: ["--lang=it"],
    defaultViewport: { width: 1350, height: 768 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(INSTAGRAM_PAGE);

  const program = pipe(
    { page },
    followedOfProfile(4000),
    TE.match(
      (e) => log("[Error] Follow followed of Profile finished: " + e)(),
      () => log("Follow followed of Profile finished")()
    )
  );
  await program();
})();
