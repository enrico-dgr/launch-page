# Using fp-ts with puppeteer

**:warning: DISCLAIMER :warning:**

This was just a way to learn fp-ts library using puppeteer. The main learning-project was the one contained in `example` dir.

Eventually I decided to separate the main library from programs.

---
`launch-page` centralizes the page for every operation you would do with puppeteer.

## Installation

```bash
npm install launch-page
```

## Usage

```ts
import { 
    LaunchOptions, launchPage
    } from 'launch-page/Puppeteer';
import { 
    log, startFrom 
    } from 'launch-page/utils';

const launchOptions: LaunchOptions = {
    headless: false,
    userDataDir: `path/to/userDataDir`,
    args: ["--lang=it"],
    defaultViewport: { width: 1050, height: 800 }
};

const program: WP.WebProgram<void> = WP.of(undefined);

// returns a `TE.TaskEither<Error, A>`,
// where `A` is the output of `program`.
const taskEitherOfProgram = 
    startFrom(program)(launchPage(launchOptions));

// returns a `TE.Task<void>`.
// Logs the result, taking into 
// account left type Error could have a 
// json message to format. (This is because
// I tried to format error message, keeping
// the stack)
const taskOfProgram = 
    log(startFrom(program)(launchPage(launchOptions)));
```

To run the two programs, simply call them, as defined for `Task` type in `fp-ts`.
