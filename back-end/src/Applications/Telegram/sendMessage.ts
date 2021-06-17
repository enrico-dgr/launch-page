import { pipe } from 'fp-ts/function';
import { Reader } from 'fp-ts/Reader';
import { waitFor$x } from 'src/dependencies';
import { click, expectedLength, type } from 'src/elementHandle';
import * as WT from 'src/index';
import {
    getPropertiesFromSettingsAndLanguage, Languages, SettingsByLanguage
} from 'src/settingsByLanguage';

import {
    Settings as SettingsTelegram, settingsByLanguage as settingsByLanguageTelegram
} from './SettingsByLanguage';

interface Settings {
  xpathOfTextAreaInDialog: string;
}
const settingsByLanguage = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsTelegram
>((sets) => ({
  xpathOfTextAreaInDialog: sets.dialog.elements.textArea.xpath,
}))(settingsByLanguageTelegram);
/**
 * @name Input of Body
 * @category type-classes
 */
interface InputOfBody {
  settings: Settings;
  text: string;
}
/**
 * @category type-classes
 */
type BodyOfSendMessage = Reader<InputOfBody, WT.WebProgram<void>>;
/**
 * Body
 */

const bodyOfSendMessage: BodyOfSendMessage = (D) =>
  pipe(
    waitFor$x(D.settings.xpathOfTextAreaInDialog),
    WT.chain(
      expectedLength((n) => n === 1)(
        (els, r) => `Found '${els.length}' textarea-input(s) at ${r.page.url()}`
      )
    ),
    WT.chain((els) => WT.of(els[0])),
    WT.chainFirst(click),
    WT.chain(WT.delay(700)),
    WT.chain(type(D.text + String.fromCharCode(13), { delay: 150 }))
  );

/**
 *
 * @param language
 * @param interlocutor
 * @returns
 */
export const sendMessage = (language: Languages) => (text: string) =>
  bodyOfSendMessage({ settings: settingsByLanguage(language), text });
