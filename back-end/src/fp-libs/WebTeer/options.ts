enum LanguagesISO6391 {
  it = "it",
}
export type LanguageSettingsKeys = keyof typeof LanguagesISO6391;
export type LanguageSettings<A> = {
  [key in LanguageSettingsKeys]: A;
};
export const languageSettingsSelector: <SettingsSelected, Settings>(
  selector: (s: Settings) => SettingsSelected
) => (
  ls: LanguageSettings<Settings>
) => (lang: LanguageSettingsKeys) => SettingsSelected = (selector) => (
  languageSettings
) => (lang) => selector(languageSettings[lang]);
