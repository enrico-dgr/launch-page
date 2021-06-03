import * as WebDepsUtils from "../../../../Utils/WebDeps";
import * as ElementUtils from "../../../../Utils/ElementHandle";
import * as WT from "../../../../index";
import * as PageXPaths from "../../XPaths/profilePage";
import { pipe } from "fp-ts/lib/function";

export const getDepsToFollow = pipe(
  PageXPaths.followButton.toClick,
  WebDepsUtils.waitFor$x,
  WT.chain(
    ElementUtils.isOneElementArray(
      (els, r) =>
        `Found "${els.length}" follow-button(s) on profile page ${r.page.url()}`
    )
  ),
  WT.orElse((e) =>
    pipe(
      PageXPaths.followButton.clicked,
      WebDepsUtils.$x,
      WT.chain(
        ElementUtils.isZeroElementArray(
          (els, r) =>
            `${e}\nProfile already followed. Found "${
              els.length
            }" alreadyFollow-button(s) on profile page ${r.page.url()}`
        )
      )
    )
  ),
  WT.chain((els) => WT.of(els[0]))
);
