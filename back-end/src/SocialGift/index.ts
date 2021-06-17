import { pipe } from 'fp-ts/function';
import { Reader } from 'fp-ts/lib/Reader';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/Semigroup';
import path from 'path';
import { ElementHandle } from 'puppeteer';
import * as WT from 'src/index';
import { waitFor$x } from 'WebTeer/dependencies';
import {
    $x, checkHTMLProperties, click, getHref, HTMLElementProperties
} from 'WebTeer/elementHandle';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'WebTeer/settingsByLanguage';
import { FollowUser, LikeToPost, WatchStoryAtUrl } from 'WT-Instagram/index';
import {
    openDialog, sendMessage, Settings as SettingsOfTelegram,
    settingsByLanguage as settingsOfTelegramByLanguage
} from 'WT-Telegram/index';

import { Settings as SettingsOfBots, settingsByBotChoice } from './settings';
import { Bots, getPropertiesFromSettingsAndBotChoice } from './settingsByBotChoice';

const ABSOLUTE_PATH = path.resolve(__dirname, "./index.ts");

/**
 * @name enumOfActions
 * @category enumeration
 */
enum enumOfActions {
  Follow = "Follow",
  Like = "Like",
  Comment = "Comment",
  WatchStory = "WatchStory",
  Extra = "EXTRA",
}
/**
 * @name enumOfActions
 * @category keys
 */
export type TypeOfActions = keyof typeof enumOfActions;
/**
 * @name Options
 * @category type-classes
 */
type Options = {
  skip: { [key in TypeOfActions]: boolean };
};
/**
 * @name Settings
 * @category type-classes
 */
interface Settings {
  message: {
    xpath: string;
    link: {
      relativeXPath: string;
    };
    buttonConfirm: {
      relativeXPath: string;
    };
    buttonSkip: {
      relativeXPath: string;
    };
    expectedTextOfMessagesWithAction: {
      [k in TypeOfActions]: HTMLElementProperties<HTMLElement, string>;
    };
  };
  buttonNewAction: {
    text: string;
  };
}
/**
 * @name InputOfBody
 * @category type-classes
 */
interface InputOfBody {
  nameOfBot: Bots;
  language: Languages;
  settings: Settings;
  options: Options;
}
// ----------------------------------
// Output
// ----------------------------------
/**
 *
 */
/**
 * @name Output
 * @category type-classes
 */
type Output = {};
/**
 * @category type
 */
type BodyOfActuator = Reader<InputOfBody, WT.WebProgram<Output>>;
/**
 * Body
 */
const bodyOfActuator: BodyOfActuator = (D) => {
  // --------------------------
  // Find message of Action
  // --------------------------
  type ActionAndWronprops = {
    action: TypeOfActions;
    wrongProps: HTMLElementProperties<HTMLElement, string>;
  };
  const defaultActionAndWrongprops: ActionAndWronprops = {
    action: "Comment",
    wrongProps: [["innerText", ""]],
  };
  /**
   * @category semigroup-instance
   */
  const semigroupChainMatchedAction: S.Semigroup<
    WT.WebProgram<ActionAndWronprops>
  > = {
    concat: (x, y) =>
      pipe(
        x,
        WT.chain((a) => (a.wrongProps.length < 1 ? WT.of(a) : y))
      ),
  };
  const concatAll = S.concatAll(semigroupChainMatchedAction)(
    WT.of(defaultActionAndWrongprops)
  );
  /**
   *
   */
  interface FoundMessage extends ActionAndWronprops {
    _tag: "FoundMessage";
    el: ElementHandle<Element>;
  }
  interface NotFoundMessage {
    _tag: "NotFoundMessage";
  }
  type OutputOfFindLast = FoundMessage | NotFoundMessage;
  const findLastWithAMatch = (
    els: ElementHandle<Element>[]
  ): WT.WebProgram<OutputOfFindLast> =>
    els.length < 1
      ? WT.of({ _tag: "NotFoundMessage" })
      : pipe(
          Object.entries(
            D.settings.message.expectedTextOfMessagesWithAction
          ).map(
            // Object.entries doesn't let you specify keys,
            // ending up with string keys.
            (
              actionAndProps: [
                string,
                HTMLElementProperties<HTMLElement, string>
              ]
            ) =>
              pipe(
                els[els.length - 1],
                checkHTMLProperties(actionAndProps[1]),
                WT.map((wrongProps) => ({
                  // To avoid typescript complaints -> `as TypeOfActions`
                  action: actionAndProps[0] as TypeOfActions,
                  wrongProps,
                }))
              )
          ),
          concatAll,
          WT.chain(({ action, wrongProps }) =>
            wrongProps.length < 1
              ? WT.of({
                  _tag: "FoundMessage",
                  action,
                  wrongProps,
                  el: els[els.length - 1],
                })
              : findLastWithAMatch(els.slice(0, els.length - 1))
          )
        );

  // --------------------------
  // Action
  // --------------------------
  const runAction = (action: TypeOfActions) => (el: ElementHandle<Element>) => {
    // --------------------------
    // Get Infos for Action
    // --------------------------
    const getActionHref: () => WT.WebProgram<string> = () =>
      pipe(
        $x(D.settings.message.link.relativeXPath)(el),
        WT.chain((els) =>
          els.length === 1
            ? WT.of(els[0])
            : WT.left(
                new Error(
                  `Found ${els.length} HTMLAnchorElement(s) containing 'http'.`
                )
              )
        ),
        WT.chain(getHref),
        WT.chain(
          O.match(() => WT.left(new Error("No link at bot message")), WT.of)
        ),
        WT.orElseStackErrorInfos({
          message: `In message with bot ${D.nameOfBot}`,
          nameOfFunction: "getActionHref",
          filePath: ABSOLUTE_PATH,
        })
      );
    // --------------------------
    // Actions Implementation
    // --------------------------
    /**
     * @category type
     */
    type OutcomeOfAction = { outcome: "Confirm" | "Skip"; info: {} };
    /**
     * @category constructors
     */
    const returnSkip = (info: {}): OutcomeOfAction => ({
      outcome: "Skip",
      info,
    });
    const returnConfirm = (info: {}): OutcomeOfAction => ({
      outcome: "Confirm",
      info,
    });
    /**
     * implementations
     */
    const implementations: {
      [k in TypeOfActions]: (url: URL) => WT.WebProgram<OutcomeOfAction>;
    } = {
      Follow: (url: URL) =>
        pipe(
          FollowUser.followUser({
            language: D.language,
            profileUrl: url,
            options: { allowPrivate: false },
          }),
          WT.map<FollowUser.Output, OutcomeOfAction>((o) =>
            o._tag === "NotFollowed" ? returnSkip(o) : returnConfirm(o)
          )
        ),
      Like: (url: URL) =>
        pipe(
          LikeToPost.likeToPost({
            language: D.language,
            urlOfPost: url,
            options: {},
          }),
          WT.map((o) =>
            o._tag === "NotLiked" ? returnSkip(o) : returnConfirm(o)
          )
        ),
      WatchStory: (url: URL) =>
        pipe(
          WatchStoryAtUrl.watchStoryAtUrl({
            language: D.language,
            storyUrl: url,
            options: {},
          }),
          WT.map((o) =>
            o._tag === "AllWatched" ? returnConfirm(o) : returnSkip(o)
          )
        ),
      Comment: (url: URL) =>
        WT.of(
          returnSkip({ message: "Comment is not implemented", url: url.href })
        ),
      Extra: (url: URL) =>
        WT.of(
          returnSkip({ message: "Extra is not implemented", url: url.href })
        ),
    };

    // --------------------------
    // Skip, Confirm
    // --------------------------
    const skip: () => WT.WebProgram<void> = () =>
      pipe(
        $x(D.settings.message.buttonSkip.relativeXPath)(el),
        WT.chain((els) =>
          els.length === 1
            ? WT.of(els[0])
            : WT.left(
                new Error(
                  `Found ${els.length} HTMLButtonElement(s) containing skip-button.`
                )
              )
        ),
        WT.chain(click),
        WT.orElseStackErrorInfos({
          message: `In message with bot ${D.nameOfBot}`,
          nameOfFunction: "getSkipButton",
          filePath: ABSOLUTE_PATH,
        })
      );
    const confirm: () => WT.WebProgram<void> = () =>
      pipe(
        $x(D.settings.message.buttonConfirm.relativeXPath)(el),
        WT.chain((els) =>
          els.length === 1
            ? WT.of(els[0])
            : WT.left(
                new Error(
                  `Found ${els.length} HTMLButtonElement(s) containing confirm-button.`
                )
              )
        ),
        WT.chain(click),
        WT.orElseStackErrorInfos({
          message: `In message with bot ${D.nameOfBot}`,
          nameOfFunction: "getConfirmButton",
          filePath: ABSOLUTE_PATH,
        })
      );
    // --------------------------
    // Core of RunAction
    // --------------------------
    return pipe(
      getActionHref(),
      WT.map((href) => new URL(href)),
      WT.chain((url) =>
        D.options.skip[action]
          ? WT.of(
              returnSkip({
                message: `${action} skipped because of option's skip === true`,
              })
            )
          : implementations[action](url)
      ),
      WT.chainFirst((a) => (a.outcome === "Confirm" ? confirm() : skip()))
    );
  };

  // --------------------------
  // Cycle
  // --------------------------
  type ResultOfCycle = "NewAction" | "Confirm" | "Skip" | "End";
  type StateOfCycle = {
    _tag: ResultOfCycle;
    /**
     * should be less than 5
     */
    consecutiveSkips: number;
    /**
     * should be less than 5
     */
    consecutiveNewActions: number;
  };
  const updateState = (soc: StateOfCycle): StateOfCycle => {
    switch (soc._tag) {
      case "Confirm":
        return { ...soc, consecutiveSkips: 0, consecutiveNewActions: 0 };
      case "Skip":
        return { ...soc, consecutiveSkips: soc.consecutiveSkips + 1 };
      case "NewAction":
        return { ...soc, consecutiveNewActions: soc.consecutiveNewActions + 1 };
      case "End":
        return { ...soc };
    }
  };
  /**
   * @name cycle
   */
  const cycle = (
    soc: StateOfCycle = {
      _tag: "Confirm",
      consecutiveSkips: 0,
      consecutiveNewActions: 0,
    }
  ): WT.WebProgram<StateOfCycle> =>
    soc._tag === "End"
      ? WT.of(soc)
      : soc.consecutiveNewActions > 5 || soc.consecutiveSkips > 5
      ? WT.of(updateState({ ...soc, _tag: "End" }))
      : pipe(
          waitFor$x(D.settings.message.xpath),
          WT.chain(findLastWithAMatch),
          WT.chain((messageOfAction) =>
            messageOfAction._tag === "NotFoundMessage"
              ? pipe(
                  sendMessage(D.language)(D.settings.buttonNewAction.text),
                  WT.map<void, ResultOfCycle>(() => "NewAction")
                )
              : pipe(
                  runAction(messageOfAction.action)(messageOfAction.el),
                  // here I could print/log infos.
                  WT.map((actionResult) => actionResult.outcome)
                )
          ),
          WT.map<ResultOfCycle, StateOfCycle>((_tag) =>
            updateState({ ...soc, _tag })
          ),
          WT.chain(cycle)
        );
  return pipe(
    openDialog(D.language)(D.nameOfBot),
    WT.chain(() => cycle())
  );
};

export interface Input {
  nameOfBot: Bots;
  language: Languages;
  options: Options;
}
export const actuator = (I: Input) => {
  const getPropsByBotChoice = <A>(selectProps: (g: SettingsOfBots) => A) =>
    getPropertiesFromSettingsAndBotChoice<A, SettingsOfBots>(selectProps)(
      settingsByBotChoice
    )(I.nameOfBot);
  const getPropsByLanguage = <A>(selectProps: (g: SettingsOfTelegram) => A) =>
    getPropertiesFromSettingsAndLanguage<A, SettingsOfTelegram>(selectProps)(
      settingsOfTelegramByLanguage
    )(I.language);

  return bodyOfActuator({
    ...I,
    settings: {
      buttonNewAction: {
        text: getPropsByBotChoice<string>(
          (sets) => sets.dialog.elements.buttonNewAction.text
        ),
      },
      message: {
        xpath: getPropsByLanguage<string>((sets) =>
          sets.message.returnXPath(I.nameOfBot, "")
        ),
        link: {
          relativeXPath: getPropsByBotChoice<string>(
            (sets) => sets.message.elements.link.relativeXPath
          ),
        },
        buttonConfirm: {
          relativeXPath: getPropsByBotChoice<string>(
            (sets) => sets.message.elements.buttonConfirm.relativeXPath
          ),
        },
        buttonSkip: {
          relativeXPath: getPropsByBotChoice<string>(
            (sets) => sets.message.elements.buttonSkip.relativeXPath
          ),
        },
        expectedTextOfMessagesWithAction: getPropsByBotChoice(
          (sets) => sets.message.expectedTextsForActions
        ),
      },
    },
  });
};
