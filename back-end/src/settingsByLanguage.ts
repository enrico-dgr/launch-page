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
