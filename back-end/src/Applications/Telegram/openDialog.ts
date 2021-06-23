import { pipe } from 'fp-ts/function';
import { Reader } from 'fp-ts/Reader';
import path from 'path';
import { waitFor$x } from 'src/dependencies';
import { click, expectedLength } from 'src/elementHandle';
import * as WT from 'src/index';
import {
    getPropertiesFromSettingsAndLanguage, Languages, SettingsByLanguage
} from 'src/settingsByLanguage';

import {
    Settings as SettingsTelegram, settingsByLanguage as settingsByLanguageTelegram
} from './SettingsByLanguage';

const ABSOLUTE_PATH = path.resolve(__dirname, "./index.ts");
// --------------------------------
// Input
// --------------------------------
interface Settings {
  dialogXPath: (interlocutor: string) => string;
}
const settingsByLanguage = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsTelegram
>((sets) => ({
  dialogXPath: sets.dialogLink.returnXPath,
}))(settingsByLanguageTelegram);
/**
 *
 */
interface InputOfBody {
  settings: Settings;
  interlocutor: string;
}

// --------------------------------
// Body
// --------------------------------
/**
 *
 */
type BodyOfOpenDialog = Reader<InputOfBody, WT.WebProgram<void>>;
/**
 *
 */
const bodyOfOpenDialog: BodyOfOpenDialog = (D) =>
  pipe(
    waitFor$x(D.settings.dialogXPath(D.interlocutor)),
    WT.chain((els) =>
      els.length === 1
        ? click()(els[0])
        : WT.leftFromErrorInfos({
            message:
              `Chat with ${D.interlocutor} has not been opened.\n` +
              `${els.length} links to dialog found.`,
            nameOfFunction: "bodyOfActuator",
            filePath: ABSOLUTE_PATH,
          })
    )
  );
/**
 *
 */
export const openDialog = (language: Languages) => (interlocutor: string) =>
  bodyOfOpenDialog({ settings: settingsByLanguage(language), interlocutor });
