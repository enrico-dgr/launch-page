import { ElementProps } from 'WebTeer/Utils/ElementHandle';

export interface Setting {
  buttonFollow: {
    expectedProps: {
      preFollow: ElementProps<HTMLButtonElement, string>[];
      postFollow: ElementProps<HTMLButtonElement, string>[];
    };
  };
  profilePage: {
    elements: {
      privateProfile: {
        XPath: string;
      };
      buttonFollow: {
        XPath: string;
      };
    };
  };
}
