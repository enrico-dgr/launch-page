enum EnumOfLanguagesISO6391 {
  it = "it",
}
export type Languages = keyof typeof EnumOfLanguagesISO6391;
export type SettingsByLanguage<TypeOfSettings> = {
  [key in Languages]: TypeOfSettings;
};
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
