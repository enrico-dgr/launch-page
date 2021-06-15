import { ElementProps } from 'src/WebTeer/Utils/ElementHandle';

export interface Settings {
  buttonFollow: {
    expectedProps: {
      preFollow: ElementProps<HTMLButtonElement, string>[];
      postFollow: ElementProps<HTMLButtonElement, string>[];
    };
  };
  buttonLike: {
    svg: {
      expectedProps: {
        preLike: ElementProps<HTMLOrSVGImageElement, string>[];
        postLike: ElementProps<HTMLOrSVGImageElement, string>[];
      };
      /**
       * XPath relative to buttonLike
       */
      XPath: string;
      /**
       * XPath relative to buttonLike
       */
      XPathPreLike: string;
      /**
       * XPath relative to buttonLike
       */
      XPathPostLike: string;
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
      buttonAlreadyFollow: {
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
