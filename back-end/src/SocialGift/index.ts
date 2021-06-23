import { flow, pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/lib/IO';
import { Reader } from 'fp-ts/lib/Reader';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/Semigroup';
import path from 'path';
import { ElementHandle, Page } from 'puppeteer';
import * as WT from 'src/index';
import {
    bringToFront, goto, openNewPage, otherPages, runOnAnyDifferentPage, waitFor$x
} from 'WebTeer/dependencies';
import { $x, click, getHref, getInnerText, HTMLElementProperties } from 'WebTeer/elementHandle';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'WebTeer/settingsByLanguage';
import { FollowUser, LikeToPost, WatchStoryAtUrl } from 'WT-Instagram/index';
import {
    sendMessage, Settings as SettingsOfTelegram, settingsByLanguage as settingsOfTelegramByLanguage
} from 'WT-Telegram/index';

import { newBadReport, newConfirmedReport, newSkipReport, Report } from './logs/jsonDB';
import { Settings as SettingsOfBots, settingsByBotChoice } from './settings';
import { Bots, getPropertiesFromSettingsAndBotChoice } from './settingsByBotChoice';

const ABSOLUTE_PATH = path.resolve(__dirname, "./index.ts");
const CYCLE_DELAY = 3 * 60 * 1000;
/**
 *
 */
enum enumOfActions {
  Follow = "Follow",
  Like = "Like",
  Comment = "Comment",
  WatchStory = "WatchStory",
  Extra = "EXTRA",
}
/**
 *
 */
export type TypeOfActions = keyof typeof enumOfActions;
/**
 *
 */
type Options = {
  skip: { [key in TypeOfActions]: boolean };
};
/**
 *
 */
interface Settings {
  chatUrl: URL;
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
    expectedContainedTextOfMessagesWithAction: {
      [k in TypeOfActions]: HTMLElementProperties<HTMLElement, string>;
    };
  };
  buttonNewAction: {
    text: string;
  };
}
/**
 *
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
type Output = {};
/**
 *
 */
type BodyOfActuator = Reader<InputOfBody, WT.WebProgram<Output>>;
/**
 *
 */
const bodyOfActuator: BodyOfActuator = (D) => {
  // --------------------------
  // Retrieve all loaded messages
  // --------------------------
  const messages = () => waitFor$x(D.settings.message.xpath);
  // --------------------------
  // Find message of Action
  // --------------------------
  type ActionAndFound = {
    action: TypeOfActions;
    found: boolean;
  };
  const defaultActionAndWrongprops: ActionAndFound = {
    action: "Comment",
    found: false,
  };
  /**
   *
   */
  const semigroupChainMatchedAction: S.Semigroup<
    WT.WebProgram<ActionAndFound>
  > = {
    concat: (x, y) =>
      pipe(
        x,
        WT.chain((a) => (a.found ? WT.of(a) : y))
      ),
  };
  /**
   *
   */
  const concatAll = S.concatAll(semigroupChainMatchedAction)(
    WT.of(defaultActionAndWrongprops)
  );
  /**
   *
   */
  interface FoundMessage {
    _tag: "FoundMessage";
    el: ElementHandle<Element>;
    action: TypeOfActions;
  }
  /**
   *
   */
  interface NotFoundMessage {
    _tag: "NotFoundMessage";
  }
  /**
   *
   */
  type LastMessageWithAction = FoundMessage | NotFoundMessage;
  /**
   * @todo refactor
   */
  const findLastMessageWithAction = (
    els: ElementHandle<Element>[]
  ): WT.WebProgram<LastMessageWithAction> =>
    els.length < 1
      ? WT.of({ _tag: "NotFoundMessage" })
      : pipe(
          Object.entries(
            D.settings.message.expectedContainedTextOfMessagesWithAction
          ).map(
            // Object.entries doesn't let you specify keys,
            // ending up with string keys.
            (actionAndProps) =>
              pipe(
                els[els.length - 1],
                getInnerText,
                WT.chain(
                  O.match(
                    () => WT.left(new Error("No innerText in msg")),
                    (text) => WT.of(text.search(actionAndProps[1][0][1]) > -1)
                  )
                ),
                WT.map((found) => ({
                  // To avoid typescript complaints -> `as TypeOfActions`
                  action: actionAndProps[0] as TypeOfActions,
                  found,
                }))
              )
          ),
          concatAll,
          WT.chain(({ action, found }) =>
            found
              ? WT.of<LastMessageWithAction>({
                  _tag: "FoundMessage",
                  el: els[els.length - 1],
                  action,
                })
              : findLastMessageWithAction(els.slice(0, els.length - 1))
          ),
          WT.orElseStackErrorInfos({
            message: "",
            nameOfFunction: "findLastMessageWithAction",
            filePath: ABSOLUTE_PATH,
          })
        );
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
   *
   */
  const cycle = (
    soc: StateOfCycle = {
      _tag: "Confirm",
      consecutiveSkips: 0,
      consecutiveNewActions: 0,
    }
  ): WT.WebProgram<StateOfCycle> => {
    // --------------------------
    // Action
    // --------------------------
    const runAction = (action: TypeOfActions) => (
      messageWithAction: ElementHandle<Element>
    ): WT.WebProgram<ResultOfCycle> => {
      // --------------------------
      // Get Infos for Action
      // --------------------------
      const getActionHref: () => WT.WebProgram<string> = () =>
        pipe(
          $x(D.settings.message.link.relativeXPath)(messageWithAction),
          WT.chain((els) =>
            els.length === 1
              ? WT.of(els[0])
              : pipe(
                  getInnerText(messageWithAction),
                  WT.chain((text) =>
                    WT.left(
                      new Error(
                        `Found ${els.length} HTMLAnchorElement(s) containing 'http'.\n` +
                          `Text of message is: ${text}`
                      )
                    )
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
       *
       */
      type KindsOfOutcomeOfAction = "Confirm" | "Skip" | "End";
      type OutcomeOfAction = { outcome: KindsOfOutcomeOfAction; info: {} };
      /**
       *
       */
      const returnSkip = (info: {}): OutcomeOfAction => ({
        outcome: "Skip",
        info,
      });
      const returnConfirm = (info: {}): OutcomeOfAction => ({
        outcome: "Confirm",
        info,
      });
      const returnEnd = (info: {}): OutcomeOfAction => ({
        outcome: "End",
        info,
      });
      /**
       *
       */
      const implementationsOfActions: {
        [k in TypeOfActions]: (url: URL) => WT.WebProgram<OutcomeOfAction>;
      } = {
        Follow: (url: URL) =>
          pipe(
            FollowUser.followUser({
              language: D.language,
              profileUrl: url,
              options: { allowPrivate: false },
            }),
            WT.chain((outputOfFollowUser) =>
              outputOfFollowUser._tag === "NotFollowed"
                ? WT.of(returnSkip(outputOfFollowUser))
                : pipe(
                    FollowUser.followUser({
                      language: D.language,
                      profileUrl: url,
                      options: { allowPrivate: false },
                    }),
                    WT.map((outputOfCheck) =>
                      outputOfCheck._tag === "NotFollowed"
                        ? returnConfirm(outputOfFollowUser)
                        : returnEnd(outputOfCheck)
                    )
                  )
            ),
            WT.orElseStackErrorInfos({
              message: "",
              nameOfFunction: "Follow",
              filePath: ABSOLUTE_PATH,
            })
          ),
        Like: (url: URL) =>
          pipe(
            LikeToPost.likeToPost({
              language: D.language,
              urlOfPost: url,
              options: {},
            }),
            WT.chain((outputOfLike) =>
              outputOfLike._tag === "NotLiked"
                ? WT.of(returnSkip(outputOfLike))
                : pipe(
                    LikeToPost.likeToPost({
                      language: D.language,
                      urlOfPost: url,
                      options: {},
                    }),
                    WT.map((outputOfCheck) =>
                      outputOfCheck._tag === "NotLiked"
                        ? returnConfirm(outputOfLike)
                        : returnEnd(outputOfCheck)
                    )
                  )
            ),
            WT.orElseStackErrorInfos({
              message: "",
              nameOfFunction: "Like",
              filePath: ABSOLUTE_PATH,
            })
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
            ),
            WT.orElseStackErrorInfos({
              message: "",
              nameOfFunction: "WatchStory",
              filePath: ABSOLUTE_PATH,
            })
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
      // Skip, Confirm, End
      // --------------------------
      const abstractionOfConfirmAndSkip: (
        nameOfFunction: KindsOfOutcomeOfAction,
        xpathOfButton: string,
        newReport: (newReport: Report) => IO<void>
      ) => (report: Report) => WT.WebProgram<ResultOfCycle> = (
        _nameOfFunction,
        _xpathOfButton,
        _newReport
      ) => (report) =>
        pipe(
          $x(_xpathOfButton)(messageWithAction),
          WT.chain((els) =>
            els.length === 1
              ? WT.of(els[0])
              : WT.left(
                  new Error(
                    `Found ${els.length} HTMLButtonElement(s) containing confirm-button.`
                  )
                )
          ),
          WT.chain(click()),
          WT.chainFirst(() => WT.fromIO(_newReport(report))),
          WT.map<void, ResultOfCycle>(() => _nameOfFunction),
          WT.orElseStackErrorInfos({
            message: `In message with bot ${D.nameOfBot}`,
            nameOfFunction: _nameOfFunction,
            filePath: ABSOLUTE_PATH,
          })
        );
      const fromActionToNewCycle: {
        [k in KindsOfOutcomeOfAction]: (
          report: Report
        ) => WT.WebProgram<ResultOfCycle>;
      } = {
        Confirm: abstractionOfConfirmAndSkip(
          "Confirm",
          D.settings.message.buttonConfirm.relativeXPath,
          newConfirmedReport
        ),
        Skip: abstractionOfConfirmAndSkip(
          "Skip",
          D.settings.message.buttonSkip.relativeXPath,
          newSkipReport
        ),
        End: (report) =>
          pipe(
            WT.fromIO(newBadReport(report)),
            WT.map<void, ResultOfCycle>(() => "End"),
            WT.orElseStackErrorInfos({
              message: `In message with bot ${D.nameOfBot}`,
              nameOfFunction: "End",
              filePath: ABSOLUTE_PATH,
            })
          ),
      };

      /**
       *
       */
      return pipe(
        getActionHref(),
        WT.chain((href) =>
          pipe(
            D.options.skip[action]
              ? WT.of(
                  returnSkip({
                    message: `${action} skipped because of option's skip === true`,
                  })
                )
              : runOnAnyDifferentPage<OutcomeOfAction>(
                  implementationsOfActions[action](new URL(href))
                ),
            WT.map((outcomeOfAction) => ({ ...outcomeOfAction, href }))
          )
        ),

        WT.chainFirst(WT.delay(1000)),

        WT.chainFirst(() => bringToFront),
        WT.chain(({ outcome: kindOfOutcome, info, href }) =>
          fromActionToNewCycle[kindOfOutcome]({
            action,
            href,
            info,
          })
        )
      );
    };
    /**
     *
     */
    const routineOfBot = flow(
      findLastMessageWithAction,
      WT.chain((messageWithAction) =>
        messageWithAction._tag === "NotFoundMessage"
          ? pipe(
              sendMessage(D.language)(D.settings.buttonNewAction.text),
              WT.map<void, ResultOfCycle>(() => "NewAction")
            )
          : pipe(runAction(messageWithAction.action)(messageWithAction.el))
      ),
      WT.orElseStackErrorInfos({
        message: "",
        nameOfFunction: "routineOfBot",
        filePath: ABSOLUTE_PATH,
      })
    );

    return soc._tag === "End"
      ? WT.of(soc)
      : soc.consecutiveNewActions > 2 || soc.consecutiveSkips > 4
      ? WT.of(updateState({ ...soc, _tag: "End" }))
      : pipe(
          WT.delay(CYCLE_DELAY)(undefined),

          WT.chain(() => messages()),
          WT.chain((messages) => routineOfBot(messages)),
          WT.map<ResultOfCycle, StateOfCycle>((_tag) =>
            updateState({ ...soc, _tag })
          ),

          WT.chain(cycle),
          WT.orElseStackErrorInfos({
            message: "",
            nameOfFunction: "cycle",
            filePath: ABSOLUTE_PATH,
          })
        );
  };
  /**
   *
   */
  return pipe(
    goto(D.settings.chatUrl.href),

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
      chatUrl: getPropsByBotChoice((sets) => sets.chatUrl),
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
        expectedContainedTextOfMessagesWithAction: getPropsByBotChoice(
          (sets) => sets.message.expectedTextsForActions
        ),
      },
    },
  });
};
