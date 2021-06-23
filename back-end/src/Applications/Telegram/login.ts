import { pipe } from 'fp-ts/function';
import path from 'path';
import { askData as askDataFromConsole } from 'src/console';
import { goto, keyboard, setUserAgent, waitFor$x } from 'src/dependencies';
import * as WT from 'src/index';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'src/settingsByLanguage';
import { click } from 'WebTeer/elementHandle';

import {
    Settings as SettingsOfTelegram, settingsByLanguage as settingsByLanguageOfTelegram
} from './SettingsByLanguage';

const ABSOLUTE_PATH = path.resolve(__dirname, "./login.ts");

// -----------------------------------
// Input of body
// -----------------------------------
/**
 *
 */
interface Settings {
  xpathOfButtonToSwitchToAccessByNumber: string;
  xpathOfInputForNumber: string;
  xpathOfInputForOTP: string;
  xpathOfButtonToGoToOTP: string;
  baseUrl: URL;
}
/**
 *
 */
enum EnumOfData {
  "NumberWithPrefix",
  "OTP",
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
  const inputForOTP = pipe(
    waitFor$x(I.settings.xpathOfInputForOTP),
    WT.chain((els) =>
      els.length === 1
        ? WT.right(els[0])
        : WT.leftAny(`Found '${els.length}' OTP-input(s).`)
    ),
    WT.orElseStackErrorInfos({
      message: `Not valid OTP-input.`,
      nameOfFunction: "inputForOTP",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const inputForNumber = pipe(
    waitFor$x(I.settings.xpathOfInputForNumber),
    WT.chain((els) =>
      els.length === 1
        ? WT.right(els[0])
        : WT.leftAny(`Found '${els.length}' number-input(s).`)
    ),
    WT.orElseStackErrorInfos({
      message: `Not valid number-input.`,
      nameOfFunction: "inputForNumber",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const buttonToGoToOTP = pipe(
    waitFor$x(I.settings.xpathOfButtonToGoToOTP),
    WT.chain((els) =>
      els.length === 1
        ? WT.right(els[0])
        : WT.leftAny(`Found '${els.length}' goToOTP-button(s).`)
    ),
    WT.orElseStackErrorInfos({
      message: `Not valid goToOTP-button.`,
      nameOfFunction: "buttonToGoToOTP",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const buttonToSwitchToAccessByNumber = pipe(
    waitFor$x(I.settings.xpathOfButtonToSwitchToAccessByNumber),
    WT.chain((els) =>
      els.length < 2
        ? WT.right(els)
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
    WT.chain(() => goto(I.settings.baseUrl.href)),
    WT.chain(() =>
      pipe(
        buttonToSwitchToAccessByNumber,
        // could be already at number input
        WT.chain((els) =>
          els.length === 1 ? click()(els[0]) : WT.of(undefined)
        )
      )
    ),
    WT.chain(() =>
      pipe(
        inputForNumber,
        WT.chain(click({ clickCount: 3 })),
        WT.chain(() => I.askData("NumberWithPrefix")),
        WT.chain((numberWithPrefix) =>
          keyboard.type(numberWithPrefix, { delay: 150 })
        )
      )
    ),
    WT.chain(() =>
      pipe(buttonToGoToOTP, WT.chain(WT.delay(750)), WT.chain(click()))
    ),
    WT.chain(() =>
      pipe(
        inputForOTP,
        // to avoid to check for visibility
        WT.chain(WT.delay(2000)),
        WT.chain(click()),
        WT.chain(() => I.askData("OTP")),
        WT.chain((OTP) => keyboard.type(OTP, { delay: 150 }))
      )
    ),
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
  SettingsOfTelegram
>((sets) => ({
  xpathOfButtonToSwitchToAccessByNumber:
    sets.loginPage.elements.buttonToSwitchToAccessByNumber.XPath,
  xpathOfInputForOTP: sets.loginPage.elements.inputForOTP.XPath,
  xpathOfInputForNumber: sets.loginPage.elements.inputForNumber.XPath,
  xpathOfButtonToGoToOTP: sets.loginPage.elements.buttonToGoToOTP.XPath,
  baseUrl: sets.urls.base,
}))(settingsByLanguageOfTelegram);
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
