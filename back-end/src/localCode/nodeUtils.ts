import { myProfiles } from './myProfiles';

export const headless = () => {
  const first = process.argv[2] ?? "true";
  return first === "false" ? false : true;
};
export const user = myProfiles.newmener2;
export const userDataDir = `./userDataDirs/folders/${user}`;
