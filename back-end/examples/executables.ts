import { Deps, jsonExecutable, launchOptions } from './Executable';
import { actuator, Options, Output } from './SocialGift/index';

// -----------------------
// Socialgift
// -----------------------

const socialgift = (opts: Options) =>
  actuator({
    language: "it",
    nameOfBot: "Socialgift",
    options: opts,
  });

const defaultDeps: Deps<Options> = {
  nameOfProgram: "Socialgift",
  user: null,
  programOptions: {
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
    ...launchOptions.default,
    headless: true,
  },
};

export const socialgiftExec = (user: string | null) =>
  jsonExecutable<Options, Output>("Socialgift", user, socialgift)(defaultDeps);
