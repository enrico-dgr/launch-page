import { pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import * as WT from 'WebTeer/index';
import { checkProperties, click, ElementProps } from 'WebTeer/Utils/ElementHandle';

/**
 * Input
 */
type ButtonProps = ElementProps<HTMLButtonElement, string>;
type ExpectedStringProperties = {
  preFollow: ButtonProps;
  postFollow: ButtonProps;
};
export interface Options {}
/**
 * Output
 */
interface tag {
  _tag: string;
}
export interface Followed extends tag {
  _tag: "Followed";
}
interface AlreadyFollowed extends tag {
  _tag: "AlreadyFollowed";
}
interface WrongProps {
  wrongProps: ButtonProps;
}
interface NotClicked extends tag, WrongProps {
  _tag: "NotClicked";
}
interface InvalidButton extends tag, WrongProps {
  _tag: "InvalidButton";
}
type Reason = AlreadyFollowed | InvalidButton | NotClicked;
export interface NotFollowed extends tag {
  _tag: "NotFollowed";
  reason: Reason;
}
export type ClickFollowButtonOutput = Followed | NotFollowed;
/**
 * Output utils
 */
const followed: Followed = { _tag: "Followed" };
const notFollowed = (reason: Reason): NotFollowed => ({
  _tag: "NotFollowed",
  reason,
});
const invalidButton = (wrongProps: ButtonProps): NotFollowed =>
  notFollowed({ _tag: "InvalidButton", wrongProps });
const notClicked = (wrongProps: ButtonProps): NotFollowed =>
  notFollowed({ _tag: "NotClicked", wrongProps });
const alreadyFollowed = notFollowed({ _tag: "AlreadyFollowed" });
/**
 * Program body
 */

interface ClickFollowButtonBodyInput {
  button: ElementHandle<HTMLButtonElement>;
  expectedStringProperties: ExpectedStringProperties;
  options: Options;
}
const clickFollowButtonBody: (
  I: ClickFollowButtonBodyInput
) => WT.WebProgram<ClickFollowButtonOutput> = (I) => {
  const isValidButton = () =>
    checkProperties(I.expectedStringProperties.preFollow)(I.button);
  const isFollowed = () =>
    checkProperties(I.expectedStringProperties.postFollow)(I.button);
  return pipe(
    isValidButton(),
    WT.chain((wrongPropsVB) =>
      wrongPropsVB.length < 1
        ? pipe(
            click(I.button),
            WT.map(() => followed)
          )
        : pipe(
            isFollowed(),
            WT.map<ButtonProps, ClickFollowButtonOutput>((wrongPropsF) =>
              wrongPropsF.length < 1
                ? alreadyFollowed
                : invalidButton(wrongPropsVB)
            )
          )
    ),
    WT.chain((f) =>
      f._tag === "Followed"
        ? pipe(
            isFollowed(),
            WT.map<ButtonProps, ClickFollowButtonOutput>((wrongPropsFPost) =>
              wrongPropsFPost.length < 1 ? f : notClicked(wrongPropsFPost)
            )
          )
        : WT.of(f)
    )
  );
};
/**
 * Program call
 */
enum Languages {
  it = "it",
}
export type LanguageSettingKeys = keyof typeof Languages;
export const languageSettings: {
  [key in LanguageSettingKeys]: ExpectedStringProperties;
} = {
  it: {
    preFollow: [["innerText", "Segui"]],
    postFollow: [["innerText", ""]],
  },
};

export interface ClickFollowButtonInput {
  button: ElementHandle<HTMLButtonElement>;
  language: LanguageSettingKeys;
  options: Options;
}
export const clickFollowButton = (I: ClickFollowButtonInput) =>
  clickFollowButtonBody({
    button: I.button,
    expectedStringProperties: languageSettings[I.language],
    options: I.options,
  });
