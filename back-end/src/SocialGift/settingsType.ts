import { HTMLElementProperties } from 'WebTeer/elementHandle';

import { TypeOfActions } from './index';

export interface Settings {
  message: {
    returnXPath: (interlocutor: string, mustContainText?: string) => string;
    elements: {
      link: { relativeXPath: string };
      buttonConfirm: { relativeXPath: string };
      buttonSkip: { relativeXPath: string };
    };
    expectedTextsForActions: {
      [k in TypeOfActions]: HTMLElementProperties<HTMLElement, string>;
    };
  };
  dialog: {
    elements: {
      buttonNewAction: {
        text: string;
      };
    };
  };
}
