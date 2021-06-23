import { pipe } from 'fp-ts/function';
import { Reader } from 'fp-ts/lib/Reader';
import path from 'path';
import * as WT from 'src/index';
import { HTMLElementProperties } from 'WebTeer/elementHandle';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'WebTeer/settingsByLanguage';
import { FollowUser, LikeToPost, WatchStoryAtUrl } from 'WT-Instagram/index';
import {
    Settings as SettingsOfTelegram, settingsByLanguage as settingsOfTelegramByLanguage
} from 'WT-Telegram/index';

import {
    newBadReport, oldestConfirmedReport, removeOldestConfirmedReport, Report
} from './logs/jsonDB';
import { Settings as SettingsOfBots, settingsByBotChoice } from './settings';
import { Bots, getPropertiesFromSettingsAndBotChoice } from './settingsByBotChoice';

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
 * @category type
 */
type BodyOfActuator = Reader<InputOfBody, WT.WebProgram<void>>;
/**
 * Body
 */
type OutcomeOfAction = { outcome: "Confirm" | "Skip"; info: {} };
const bodyOfValidator: BodyOfActuator = (D) => {
  const runAction = (action: TypeOfActions) => (
    href: string
  ): WT.WebProgram<OutcomeOfAction> => {
    const returnSkip = (info: {}): OutcomeOfAction => ({
      outcome: "Skip",
      info,
    });
    const returnConfirm = (info: {}): OutcomeOfAction => ({
      outcome: "Confirm",
      info,
    });

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

    const coreOfRunAction = pipe(
      implementations[action](new URL(href)),
      WT.chainFirst((outcomeOfAction) =>
        outcomeOfAction.outcome === "Confirm"
          ? pipe(
              action === "WatchStory"
                ? WT.of(undefined)
                : WT.fromIO(
                    newBadReport({
                      action,
                      href,
                      info: outcomeOfAction.info,
                    })
                  ),
              WT.chain(() => WT.fromIO(removeOldestConfirmedReport()))
            )
          : WT.fromIO(removeOldestConfirmedReport())
      )
    );
    return coreOfRunAction;
  };

  // --------------------------
  // Cycle
  // --------------------------

  const cycle = (): WT.WebProgram<void> =>
    pipe(
      WT.fromIO(oldestConfirmedReport),
      WT.chain<Report, OutcomeOfAction | "END">((report) =>
        report === undefined
          ? WT.of("END")
          : runAction(report.action)(report.href)
      ),
      WT.chain(WT.delay(2 * 60 * 1000)),
      WT.chain((res) => (res === "END" ? WT.of(undefined) : cycle()))
    );
  return pipe(cycle());
};

export interface Input {
  nameOfBot: Bots;
  language: Languages;
  options: Options;
}
export const validator = (I: Input) => {
  const getPropsByBotChoice = <A>(selectProps: (g: SettingsOfBots) => A) =>
    getPropertiesFromSettingsAndBotChoice<A, SettingsOfBots>(selectProps)(
      settingsByBotChoice
    )(I.nameOfBot);
  const getPropsByLanguage = <A>(selectProps: (g: SettingsOfTelegram) => A) =>
    getPropertiesFromSettingsAndLanguage<A, SettingsOfTelegram>(selectProps)(
      settingsOfTelegramByLanguage
    )(I.language);

  return bodyOfValidator({
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
