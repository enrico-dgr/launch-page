import { myProfiles } from './myProfiles';

export const headless = () => {
  const first = process.argv[2] ?? "true";
  return first === "false" ? false : true;
};
export const user = myProfiles.waverener12;
export const userDataDir = `./userDataDirs/folders/${user}`;
