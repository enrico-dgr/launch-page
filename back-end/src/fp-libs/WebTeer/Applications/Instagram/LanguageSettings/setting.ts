import { ElementProps } from 'WebTeer/Utils/ElementHandle';

export interface Setting {
  buttonFollow: {
    expectedProps: {
      preFollow: ElementProps<HTMLButtonElement, string>[];
      postFollow: ElementProps<HTMLButtonElement, string>[];
    };
  };
  buttonLike: {
    svg: {
      expectedProps: {
        preLike: ElementProps<HTMLElement, string>[];
        postLike: ElementProps<HTMLButtonElement, string>[];
      };
    };
  };
  notAvailablePage: {
    XPath: string;
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
  igPostPage: {
    elements: {
      buttonLike: {
        XPath: string;
      };
      buttonUnlike: {
        XPath: string;
      };
    };
  };
}
