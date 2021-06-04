import { log } from 'fp-ts/lib/Console';
import { pipe } from 'fp-ts/lib/function';
import P from 'puppeteer';

import * as WebTeer from './fp-libs/WebTeer';
import { freeFollowerPlan } from './fp-libs/WebTeer/Applications/MrInsta';

const runAndLog = <A>(wp: WebTeer.WebProgram<A>) =>
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

const PROFILE = instagram.myProfiles[1];
const INSTAGRAM_PAGE = instagram.pages[5];
/**
 * Main
 */
(async () => {
  const browser = await P.launch({
    headless: false,
    userDataDir: `./userDataDirs/folders/${PROFILE}`,
    args: ["--lang=it"],
    defaultViewport: {
      width: 1350,
      height: 768,
    },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  const freeFPlan = runAndLog(freeFollowerPlan("MrInsta"));
  await pipe(
    {
      page,
    },
    freeFPlan
  )();
})();
/**
 *
 */
