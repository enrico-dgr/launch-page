\*\*\*\*# ClickFollowButton

## Input

The _preFollow_ and _postFollow_ props are arrays of tuples:

```ts
import {
  checkProperties,
  click,
  ElementProps,
} from "WebTeer/Utils/ElementHandle";

type ButtonProps = ElementProps<HTMLButtonElement, string>;

type ExpectedStringProperties = {
  preFollow: ButtonProps;
  postFollow: ButtonProps;
};
export interface Options {}
```

So, given a function who takes those tuples and return boolean, we can assign in input checks as follow:

```ts
import { ExpectedStringProperties } from "./*/ClickFollowButton/index.ts";
const expectedStringProperties: ExpectedStringProperties = {
  preFollow: [["innerText", "Segui"]],
  postFollow: [["innerText", ""]],
};
```

And there are default settings based on language:

```ts
enum LanguagesISO6391 {
  it = "it",
}
export type LanguageSettingKeys = keyof typeof LanguagesISO6391;
const languageSettings: {
  [key in LanguageSettingKeys]: ExpectedStringProperties;
} = {
  it: {
    preFollow: [["innerText", "Segui"]],
    postFollow: [["innerText", ""]],
  },
};
```

The final input will be:

```ts
export interface ClickFollowButtonBodyInput {
  button: ElementHandle<HTMLButtonElement>;
  expectedStringProperties: ExpectedStringProperties;
  options: Options;
}
```

## Output

The outout should handle every known problem and good result, **either -> left** otherwise:

```ts
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
```

Plus some util:

```ts
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
```

## Program body

- input

```ts
const clickFollowButtonBody:
 (I: ClickFollowButtonBodyInput) => WT.WebProgram<ClickFollowButtonOutput> =
 (I) => {
  const isValidButton = () =>
   checkProperties(
    I.expectedStringProperties.preFollow
   )(I.button);
  const isFollowed = () =>
   checkProperties(
    I.expectedStringProperties.postFollow
   )(I.button);
  return pipe(...
```

- Is valid?

```ts
...
... return pipe(
  isValidButton(),
  WT.chain((wrongPropsVB) =>
   wrongPropsVB.length < 1 ? ... : ...
  ),
  ...
  ...
```

- Already followed?

```ts
 ...
 ...
 WT.chain((wrongPropsVB) =>
   wrongPropsVB.length < 1
  ? ...
  : pipe(
   isFollowed(),
   WT.map<ButtonProps, ClickFollowButtonOutput>(
     (wrongPropsF) =>
    wrongPropsF.length < 1
     ? alreadyFollowed // = yes
     : invalidButton(wrongPropsVB) // = no
   ) // end map
   ) // end pipe
 ), // end chain
 ...
 ...
```

- Click

```ts

 ...
 ...
 WT.chain((wrongPropsVB) =>
   wrongPropsVB.length < 1
  ? pipe(
   click(I.button),
   WT.map(() => followed)
    )
  : ... // alreadyFollowed / invalidButton
 ), // end chain
 ...
 ...
```

- Is button clicked?

```ts
...
),
WT.chain((f) =>
 f._tag === "Followed"
  ? pipe(
   // Is button clicked?
   isFollowed(),
   WT.map<ButtonProps, ClickFollowButtonOutput>(
     (wrongPropsFPost) =>
    wrongPropsFPost.length < 1
     ? f // = yes
     : notClicked(wrongProps) // = no
   ) // end of map
    ) // end of pipe
  : WT.of(f) // _tag: "NotFollowed"
 ) // end of chain
); // end of ClickFollowButton
```

## Program call

The way you call the program is:

```ts
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
```

So basic language settings don't get exports and you only implement them in the basic ClickFollowButton.
