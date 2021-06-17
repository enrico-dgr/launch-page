export interface Settings {
  urls: {
    base: URL;
  };
  dialogLink: {
    returnXPath: (interlocutor: string) => string;
  };
  message: {
    returnXPath: (interlocutor: string, mustContainText: string) => string;
  };
  dialog: {
    elements: {
      textArea: {
        xpath: string;
      };
    };
  };
}
