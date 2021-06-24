import { pipe } from 'fp-ts/function';
import path from 'path';
import { click } from 'WebTeer/elementHandle';
import { keyboard, setUserAgent, waitFor$x } from 'WebTeer/pageOfWebDeps';
import { askData as askDataFromConsole } from 'WebTeer/readline';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'WebTeer/SettingsByLanguage';
import * as WT from 'WebTeer/WebProgram';

import { goto } from './goto';
import {
    Settings as SettingsOfInstagram, settingsByLanguage as settingsByLanguageOfInstagram
} from './SettingsByLanguage';

const ABSOLUTE_PATH = path.resolve(__dirname, "./login.ts");

// -----------------------------------
// Input of body
// -----------------------------------
/**
 *
 */
interface Settings {
  xpathOfInputForPassword: string;
  xpathOfInputForId: string;
  xpathOfButtonToLogin: string;
  baseUrl: URL;
}
/**
 *
 */
enum EnumOfData {
  "Id",
  "Password",
}
type DataNames = keyof typeof EnumOfData;
/**
 *
 */
interface InputOfBody {
  settings: Settings;
  askData: (data: DataNames) => WT.WebProgram<string>;
  language: Languages;
}
// -----------------------------------
// Body
// -----------------------------------
const bodyOfLogin = (I: InputOfBody): WT.WebProgram<void> => {
  /**
   *
   */
  const inputForId = pipe(
    waitFor$x(I.settings.xpathOfInputForId),
    WT.chain((els) =>
      els.length === 1
        ? WT.right(els[0])
        : WT.leftAny(`Found '${els.length}' id-input(s).`)
    ),
    WT.orElseStackErrorInfos({
      message: `Not valid id-input.`,
      nameOfFunction: "inputForId",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const inputForPassword = pipe(
    waitFor$x(I.settings.xpathOfInputForPassword),
    WT.chain((els) =>
      els.length === 1
        ? WT.right(els[0])
        : WT.leftAny(`Found '${els.length}' password-input(s).`)
    ),
    WT.orElseStackErrorInfos({
      message: `Not valid password-input.`,
      nameOfFunction: "inputForPassword",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const buttonToLogin = pipe(
    waitFor$x(I.settings.xpathOfButtonToLogin),
    WT.chain((els) =>
      els.length === 1
        ? WT.right(els[0])
        : WT.leftAny(`Found '${els.length}' login-button(s).`)
    ),
    WT.orElseStackErrorInfos({
      message: `Not valid login-button.`,
      nameOfFunction: "buttonToLogin",
      filePath: ABSOLUTE_PATH,
    })
  );

  /**
   *
   */
  return pipe(
    setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
    ),
    WT.chain(() =>
      WT.asks((r) =>
        r.page.setViewport({
          width: 768,
          height: 1024,
          deviceScaleFactor: 2,
          isMobile: false,
          hasTouch: false,
          isLandscape: false,
        })
      )
    ),
    WT.chain(() => goto(I.language)(I.settings.baseUrl.href)),
    WT.chainFirst((a) =>
      a === "AvailablePage"
        ? WT.of(undefined)
        : WT.leftFromErrorInfos({
            message: a,
            nameOfFunction: "login > goto",
            filePath: ABSOLUTE_PATH,
          })
    ),
    WT.chain(() =>
      pipe(
        inputForId,
        WT.chain(click()),
        WT.chain(() => I.askData("Id")),
        WT.chain((Id) => keyboard.type(Id, { delay: 150 }))
      )
    ),
    WT.chain(() =>
      pipe(
        inputForPassword,
        WT.chain(click()),
        WT.chain(() => I.askData("Password")),
        WT.chain((password) => keyboard.type(password, { delay: 150 }))
      )
    ),
    WT.chain(() =>
      pipe(buttonToLogin, WT.chain(WT.delay(750)), WT.chain(click()))
    ),
    WT.chainFirst(WT.delay(1500)),
    WT.chainFirst(WT.delay(3000)),
    WT.map(() => undefined),
    WT.orElseStackErrorInfos({
      message: `Failed to login.`,
      nameOfFunction: "login",
      filePath: ABSOLUTE_PATH,
    })
  );
};
// -----------------------------------
// Input of Program
// -----------------------------------
interface InputWithSettingsImplemented {
  language: Languages;
  askData: (data: DataNames) => WT.WebProgram<string>;
}
/**
 *
 */
const settingsByLanguage = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsOfInstagram
>((sets) => ({
  xpathOfInputForId: sets.loginPage.elements.inputForId.XPath,
  xpathOfInputForPassword: sets.loginPage.elements.inputForPassword.XPath,
  xpathOfButtonToLogin: sets.loginPage.elements.buttonToLogin.XPath,
  baseUrl: sets.urls.base,
}))(settingsByLanguageOfInstagram);
// -----------------------------------
// Program
// -----------------------------------
export const login = (I: InputWithSettingsImplemented) =>
  bodyOfLogin({
    ...I,
    settings: settingsByLanguage(I.language),
  });
// -----------------------------------
// Input of Program for console
// -----------------------------------
interface InputOfProgramForConsole {
  language: Languages;
}

// -----------------------------------
// Program for console
// -----------------------------------
export const loginFromConsole = (I: InputOfProgramForConsole) =>
  login({
    ...I,
    askData: askDataFromConsole,
  });
