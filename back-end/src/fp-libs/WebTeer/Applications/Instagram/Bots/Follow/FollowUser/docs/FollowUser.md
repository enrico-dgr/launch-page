# FollowUser

## Input

```ts
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/lib/function";
import * as WT from "WebTeer/index";
import { LanguageSetting, LanguageSettingKeys } from "WebTeer/options";
import { expectedLength, isOneElementArray } from "WebTeer/Utils/ElementHandle";
import { $x, goto } from "WebTeer/Utils/WebDeps";
import {} from "WT-Instagram/XPaths/profilePage";

import {
  clickFollowButton,
  ClickFollowButtonOutput,
  Followed,
  NotFollowed,
  Options as OptionsCFBO,
  Reason as ReasonCFBO,
  tag,
} from "../ClickFollowButton";

interface Options extends OptionsCFBO {
  /**
   * on *true* allows private profiles to be followed
   */
  allowPrivate: boolean;
}
interface Setting {
  privateProfileXPath: string;
  buttonFollowXPath: string;
}
const languageSettings: LanguageSetting<Setting> = {
  it: {
    privateProfileXPath: `//*[contains(.,'private')]`,
    buttonFollowXPath: `//header//*/button[contains(text(),'Segui')]`,
  },
};
export interface FollowUserInput {
  profileUrl: URL;
  setting: Setting;
  language: LanguageSettingKeys;
  options: Options;
}
```
## Output
Extending **Reason** type,  we can pass the result of the *clickFollowButton* by spreading it.
```ts
interface CannotFollowPrivate extends tag {
  _tag: "CannotFollowPrivate";
}
export type Reason = ReasonCFBO | CannotFollowPrivate;

export type FollowUserOutput = (Followed | NotFollowed<Reason>) & {
  isPrivate: boolean;
};
```
## Program
```ts
export const followUser = (
  I: FollowUserInput
): WT.WebProgram<FollowUserOutput> => {
// check if the page is already laoded
  const isOnPage = pipe(WT.asks((r) => r.page.url() === I.profileUrl.href));
// recursive body for next function
  const isPrivate_Recur = (n: number): WT.WebProgram<boolean> =>
    pipe(
      $x(I.setting.privateProfileXPath),
      WT.map(A.isNonEmpty),
      WT.chain(WT.delay(500)),
      WT.chain((b) =>
        b ? WT.of(b) : n > 0 ? isPrivate_Recur(n - 1) : WT.of(b)
      )
    );
// check is profile is private
  const isPrivate = () => isPrivate_Recur(3);
// get button to click to follow the profile
  const getButtonFollow = pipe(
    $x(I.setting.buttonFollowXPath),
    WT.chain(
      expectedLength((n) => n === 1)((els, r) => ({
        buttonFollowXPath: I.setting.buttonFollowXPath,
        lenght: els.length,
        url: r.page.url(),
      }))
    ),
    WT.map((els) => els[0])
  );
// 		 ↓--- program body
  return pipe(
    isOnPage,
    WT.chain((b) => (b ? WT.of(undefined) : goto(I.profileUrl.href))),
	// probably useless delay
    WT.chain(WT.delay(1000)),
    WT.chain(isPrivate),
    WT.chain((isPrvt) =>
	// the only output handled by this file
      isPrvt === true && I.options.allowPrivate === false
        ? WT.of<FollowUserOutput>({
            _tag: "NotFollowed",
            reason: {
              _tag: "CannotFollowPrivate",
            },
            isPrivate: isPrvt,
          })
        : pipe(
            getButtonFollow,
            WT.chain((button) =>
			// main program
              clickFollowButton({
                language: I.language,
                options: { ...I.options },
                button,
              })
            ),
            WT.chain((o) =>
              WT.of<FollowUserOutput>({
// spreading the clickFollowButtonOutput
                ...o,
// adding new output variable
                isPrivate: isPrvt,
              })
            )
          )
    )
  );
};
```
