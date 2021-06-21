/**
 * @since 1.0.0
 */
enum EnumOfLanguagesISO6391 {
  it = "it",
}
/**
 * @since 1.0.0
 */
export type Languages = keyof typeof EnumOfLanguagesISO6391;
/**
 * @since 1.0.0
 */
export type SettingsByLanguage<TypeOfSettings> = {
  [key in Languages]: TypeOfSettings;
};

/**
 * @example
 * // FILE: src/googleSettings.ts
 * import { SettingsByLanguage } from 'WebTeer/settingsByLanguage';
 *
 * export interface Settings {
 *  inputXPath: string;
 *  // ... other settings
 * }
 * export const settingsByLanguage: SettingsByLanguage<Settings> = {
 *  it: {
 *    inputXPath: string;
 *    // ... other settings
 *  }
 * }
 *
 * // FILE: src/program.ts
 * import {
 *  getPropertiesFromSettingsAndLanguage,
 *  Languages,
 *  SettingsByLanguage
 * } from 'WebTeer/settingsByLanguage';
 * import {
 *  Settings as SettingsOfGoogle,
 *  settingsByLanguage as settingsByLanguageOfGoogle
 * } from 'src/googleSettings.ts';
 * // --------------------------------
 * // Input of program
 * // --------------------------------
 * interface SettingsOfProgram {
 *  inputXPath: string;
 * }
 * // -
 * const settingsByLanguage = getPropertiesFromSettingsAndLanguage<
 *  SettingsOfProgram,
 *  SettingsOfGoogle
 * >((sets) => ({
 *  inputXPath: sets.inputXPath,
 * }))(settingsByLanguageTelegram);
 * // -
 * interface InputOfProgram {
 *  settings: SettingsOfProgram
 * }
 * // --------------------------------
 * // Program
 * // --------------------------------
 * const program = (I: InputOfProgram) => pipe(...);
 * // -
 * export const runProgram = (language: Languages) =>
 *  program({ settings: settingsByLanguage(language)});
 *
 * @since 1.0.0
 */
export const getPropertiesFromSettingsAndLanguage: <
  TypeOfProperties,
  TypeOfSettings
>(
  getPropertiesFromSettings: (g: TypeOfSettings) => TypeOfProperties
) => (
  settingsByLanguage: SettingsByLanguage<TypeOfSettings>
) => (language: Languages) => TypeOfProperties = (
  getPropertiesFromSettings
) => (settingsByLanguage) => (language) =>
  getPropertiesFromSettings(settingsByLanguage[language]);
