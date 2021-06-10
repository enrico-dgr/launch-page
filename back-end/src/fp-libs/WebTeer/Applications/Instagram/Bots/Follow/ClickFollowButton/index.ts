import { pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import * as WT from 'WebTeer/index';

/**
 * Input
 */
export type ButtonProps = [keyof HTMLButtonElement, string][];
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
    preFollow: [["innerText", "Segui"]],
    postFollow: [["innerText", ""]],
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
/**
 * Output
 */
interface tag {
  _tag: string;
}
export interface Followed extends tag {
  _tag: "Followed";
}
type Reason = "AlreadyFollowed" | "InvalidButton" | "NotClicked";
export interface NotFollowed extends tag {
  _tag: "NotFollowed";
  reason: Reason;
}
export type ClickFollowButtonOutput = Followed | NotFollowed;
/**
 * Output utils
 */
const notFollowed = (reason: Reason): NotFollowed => ({
  _tag: "NotFollowed",
  reason,
});
const followed: Followed = { _tag: "Followed" };
/**
 * Program
 */
export interface ClickFollowButtonDeps {
  readonly isFollowed: (
    button: ElementHandle<HTMLButtonElement>,
    postClick: ButtonProps
  ) => WT.WebProgram<boolean>;
  readonly isValidButton: (
    button: ElementHandle<HTMLButtonElement>,
    preClick: ButtonProps
  ) => WT.WebProgram<boolean>;
  readonly click: (
    button: ElementHandle<HTMLButtonElement>
  ) => WT.WebProgram<void>;
}
export const getClickFollowButton: (
  D: ClickFollowButtonDeps
) => (I: ClickFollowButtonInput) => WT.WebProgram<ClickFollowButtonOutput> = (
  D
) => (I) =>
  pipe(
    D.isValidButton(I.button, I.expectedStringProperties.preFollow),
    WT.chain((isVB) =>
      isVB
        ? pipe(
            D.click(I.button),
            WT.map(() => followed)
          )
        : pipe(
            D.isFollowed(I.button, I.expectedStringProperties.postFollow),
            WT.map<boolean, ClickFollowButtonOutput>((isF) =>
              isF
                ? notFollowed("AlreadyFollowed")
                : notFollowed("InvalidButton")
            )
          )
    ),
    WT.chain((f) =>
      f._tag === "Followed"
        ? pipe(
            D.isFollowed(I.button, I.expectedStringProperties.postFollow),
            WT.map<boolean, ClickFollowButtonOutput>((isF) =>
              isF ? f : notFollowed("NotClicked")
            )
          )
        : WT.of(f)
    )
  );
