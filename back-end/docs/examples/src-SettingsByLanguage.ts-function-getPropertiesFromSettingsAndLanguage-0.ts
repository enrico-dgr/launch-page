// FILE: src/googleSettings.ts
import {
 SettingsByLanguage, getPropertiesFromSettingsAndLanguage, Languages
} from '../../src/SettingsByLanguage';

export interface SettingsOfGoogle {
 inputXPath: string;
 // ... other settings
}
export const settingsByLanguageOfGoogle: SettingsByLanguage<SettingsOfGoogle> = {
 it: {
   inputXPath: '//input'
   // ... other settings
 }
}

// FILE: src/program.ts
import * as WP from "../../src/WebProgram";
// --------------------------------
// Input of program
// --------------------------------
interface SettingsOfProgram {
 inputXPath: string;
}
// -
const settingsByLanguage = getPropertiesFromSettingsAndLanguage<
 SettingsOfProgram,
 SettingsOfGoogle
>((sets) => ({
 inputXPath: sets.inputXPath,
}))(settingsByLanguageOfGoogle);
// -
interface InputOfProgram {
 settings: SettingsOfProgram
}
// --------------------------------
// Program
// --------------------------------
const program = (I: InputOfProgram) => WP.asks(() => `do something`);
// -
export const runProgram = (language: Languages) =>
 program({ settings: settingsByLanguage(language)});
