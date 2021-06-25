import { pipe } from 'fp-ts/function';
import { Reader } from 'fp-ts/lib/Reader';
import { HTMLElementProperties } from 'src/elementHandle';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'src/SettingsByLanguage';
import * as WP from 'src/WebProgram';

import { FollowUser, LikeToPost, WatchStoryAtUrl } from '../Instagram';
import {
    Settings as SettingsOfTelegram, settingsByLanguage as settingsOfTelegramByLanguage
} from '../Telegram/index';
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
type BodyOfActuator = Reader<InputOfBody, WP.WebProgram<void>>;
/**
 * Body
 */
type OutcomeOfAction = { outcome: "Confirm" | "Skip"; info: {} };
const bodyOfValidator: BodyOfActuator = (D) => {
  const runAction = (action: TypeOfActions) => (
    href: string
  ): WP.WebProgram<OutcomeOfAction> => {
    const returnSkip = (info: {}): OutcomeOfAction => ({
      outcome: "Skip",
      info,
    });
    const returnConfirm = (info: {}): OutcomeOfAction => ({
      outcome: "Confirm",
      info,
    });

    const implementations: {
      [k in TypeOfActions]: (url: URL) => WP.WebProgram<OutcomeOfAction>;
    } = {
      Follow: (url: URL) =>
        pipe(
          FollowUser.followUser({
            language: D.language,
            profileUrl: url,
            options: { allowPrivate: false },
          }),
          WP.map<FollowUser.Output, OutcomeOfAction>((o) =>
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
          WP.map((o) =>
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
          WP.map((o) =>
            o._tag === "AllWatched" ? returnConfirm(o) : returnSkip(o)
          )
        ),
      Comment: (url: URL) =>
        WP.of(
          returnSkip({ message: "Comment is not implemented", url: url.href })
        ),
      Extra: (url: URL) =>
        WP.of(
          returnSkip({ message: "Extra is not implemented", url: url.href })
        ),
    };

    const coreOfRunAction = pipe(
      implementations[action](new URL(href)),
      WP.chainFirst((outcomeOfAction) =>
        outcomeOfAction.outcome === "Confirm"
          ? pipe(
              action === "WatchStory"
                ? WP.of(undefined)
                : WP.fromIO(
                    newBadReport({
                      action,
                      href,
                      info: outcomeOfAction.info,
                    })
                  ),
              WP.chain(() => WP.fromIO(removeOldestConfirmedReport()))
            )
          : WP.fromIO(removeOldestConfirmedReport())
      )
    );
    return coreOfRunAction;
  };

  // --------------------------
  // Cycle
  // --------------------------

  const cycle = (): WP.WebProgram<void> =>
    pipe(
      WP.fromIO(oldestConfirmedReport),
      WP.chain<Report, OutcomeOfAction | "END">((report) =>
        report === undefined
          ? WP.of("END")
          : runAction(report.action)(report.href)
      ),
      WP.chain(WP.delay(2 * 60 * 1000)),
      WP.chain((res) => (res === "END" ? WP.of(undefined) : cycle()))
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
