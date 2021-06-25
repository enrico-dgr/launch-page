import { Deps, jsonExecutable } from './Executable';
import { actuator, Input, Options, Output } from './SocialGift/index';

const socialgift = (opts: Options) =>
  actuator({
    language: "it",
    nameOfBot: "Socialgift",
    options: opts,
  });

const defaultDeps: Deps<Options> = {
  nameOfProgram: socialgift.name,
  r: {
    skip: {
      Follow: false,
      Like: false,
      Comment: true,
      WatchStory: false,
      Extra: true,
    },
    delayBetweenCycles: 3 * 60 * 1000,
  },
  launchOptions: {
    headless: false,
    userDataDir: `src/../userDataDirs/folders/newmener2`,
    args: [
      "--lang=it",
      "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4403.0 Safari/537.36",
    ],
    defaultViewport: { width: 1050, height: 800 },
  },
};

export const socialgiftExec = jsonExecutable<Options, Output>(socialgift)(
  defaultDeps
);
