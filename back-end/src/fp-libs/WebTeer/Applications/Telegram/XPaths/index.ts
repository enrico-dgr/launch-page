type GetXPaths = (...args: string[]) => string;
const getDialogLink: GetXPaths = (dialogName: string) =>
  `//a[@class='im_dialog' and contains(., '${dialogName}')]`;

export { getDialogLink };
