import { pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import * as WT from 'WebTeer/index';

export type ButtonProps = { [k in keyof HTMLButtonElement]?: string };
export type ExpectedStringProperties = {
  preFollow: ButtonProps;
  postFollow: ButtonProps;
};
enum LanguageSettingsKeys {
  it = "it",
}
export const languageSettings: {
  [key in LanguageSettingsKeys]: ExpectedStringProperties;
} = {
  it: {
    preFollow: { innerText: "Segui" },
    postFollow: { innerText: "" },
  },
};
export interface ClickFollowButtonInput {
  button: ElementHandle<HTMLButtonElement>;
  expectedStringProperties: ExpectedStringProperties;
  options: {
    /**
     * on *true* allows private profiles to be followed
     */
    allowFollowPrivate: boolean;
  };
}

export interface ClickFollowButtonDeps {
  readonly isFollowed: (postClick: ButtonProps) => WT.WebProgram<void>;
  readonly isValidButton: (
    button: ElementHandle<HTMLButtonElement>,
    preClick: ButtonProps
  ) => WT.WebProgram<void>;
  readonly click: (
    button: ElementHandle<HTMLButtonElement>
  ) => WT.WebProgram<void>;
}
interface tag {
  _tag: string;
}
export interface Followed extends tag {
  _tag: "Followed";
}
export interface NotFollowed extends tag {
  _tag: "NotFollowed";
  reason: "AlreadyFollowed" | "InvalidButton" | "NotClicked";
}
export type ClickFollowButtonOutput = Followed | NotFollowed;
export const getClickFollowButton: (
  D: ClickFollowButtonDeps
) => (I: ClickFollowButtonInput) => ClickFollowButtonOutput = (D) => (I) =>
  pipe(D.isFollowed());
