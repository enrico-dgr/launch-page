import * as A from 'fp-ts/Array';
import * as B from 'fp-ts/boolean';
import { pipe } from 'fp-ts/function';
import * as fs from 'fs';
import path from 'path';
import { devices } from 'puppeteer';
import { click, uploadFile } from 'WebTeer/elementHandle';
import { browser, emulate, keyboard, reload, waitFor$x } from 'WebTeer/pageOfWebDeps';
import { getPropertiesFromSettingsAndLanguage, Languages } from 'WebTeer/SettingsByLanguage';
import * as WT from 'WebTeer/WebProgram';

import {
    Settings as SettingsOfInstagram, settingsByLanguage as settingsByLanguageOfInstagram
} from './SettingsByLanguage';

const ABSOLUTE_PATH = path.resolve(__dirname, "./postNewMedia.ts");

// -----------------------------------
// Input of body
// -----------------------------------
/**
 *
 */
interface Settings {
  xpathOfButtonForNewPost: string;
  xpathOfInputToUploadMedia: string;
  xpathOfButtonForNextOperation: string;
  xpathOfTextareaForDescription: string;
  xpathOfButtonToShareMedia: string;
}
/**
 *
 */
interface InputOfBody {
  settings: Settings;
  imageSystemPath: string;
  description: string;
}
// -----------------------------------
// Body
// -----------------------------------
const bodyOfPostNewMedia = (I: InputOfBody): WT.WebProgram<void> => {
  /**
   *
   */
  const device = devices["iPhone 6"];
  /**
   *
   */
  const newPostButton = pipe(
    waitFor$x(I.settings.xpathOfButtonForNewPost),
    WT.chain((els) =>
      pipe(
        A.isEmpty(els),
        B.match(
          () =>
            pipe(
              emulate(device),
              WT.chain(() => reload()),
              WT.chain(() => waitFor$x(I.settings.xpathOfButtonForNewPost))
            ),
          () => WT.right(els)
        )
      )
    ),
    WT.chain((els) =>
      els.length === 1
        ? WT.right(els[0])
        : WT.leftAny(`Found '${els.length}' newPost-button(s).`)
    ),
    WT.orElseStackErrorInfos({
      message: `Not valid newPost-button.`,
      nameOfFunction: "newPostButton",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const validateMedia = () =>
    pipe(
      I.imageSystemPath,
      WT.fromPredicate(
        (path) =>
          path.toLowerCase().endsWith("jpg") ||
          path.toLowerCase().endsWith("jpeg") ||
          path.toLowerCase().endsWith("mp4"),
        (path) =>
          new Error(
            `Instagram only accepts jpeg/jpg images.\n` +
              `Path "${path}" is not valid.`
          )
      ),
      WT.chain(
        WT.fromPredicate(
          fs.existsSync,
          (path) =>
            new Error(
              `The image you specified does not exist.\n` +
                `Path "${path}" does not exist.`
            )
        )
      ),
      WT.orElseStackErrorInfos({
        message: "Not valid media to post.",
        nameOfFunction: "validateMedia",
        filePath: ABSOLUTE_PATH,
      }),
      WT.map<fs.PathLike, void>(() => undefined)
    );
  /**
   * @todo validation of element
   */
  const inputForMedia = pipe(
    waitFor$x(I.settings.xpathOfInputToUploadMedia),
    WT.chain((els) =>
      els.length === 1
        ? WT.right(els[0])
        : WT.leftAny(`Found '${els.length}' media-input(s).`)
    ),
    WT.orElseStackErrorInfos({
      message: `Not valid media-input.`,
      nameOfFunction: "inputForMedia",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const buttonForNextOperation = pipe(
    waitFor$x(I.settings.xpathOfButtonForNextOperation),
    WT.chain((els) =>
      els.length === 1
        ? WT.right(els[0])
        : WT.leftAny(`Found '${els.length}' nextOperation-button(s).`)
    ),
    WT.orElseStackErrorInfos({
      message: `Not valid nextOperation-button.`,
      nameOfFunction: "buttonForNextOperation",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const textareaForDescription = pipe(
    waitFor$x(I.settings.xpathOfTextareaForDescription),
    WT.chain((els) =>
      els.length === 1
        ? WT.right(els[0])
        : WT.leftAny(`Found '${els.length}' description-textarea(s).`)
    ),
    WT.orElseStackErrorInfos({
      message: `Not valid description-textarea.`,
      nameOfFunction: "textareaForDescription",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const buttonToShareMedia = pipe(
    waitFor$x(I.settings.xpathOfButtonToShareMedia),
    WT.chain((els) =>
      els.length === 1
        ? WT.right(els[0])
        : WT.leftAny(`Found '${els.length}' shareMedia-button(s).`)
    ),
    WT.orElseStackErrorInfos({
      message: `Not valid shareMedia-button.`,
      nameOfFunction: "buttonToShareMedia",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  return pipe(
    newPostButton,
    WT.chain(click()),
    WT.chain(validateMedia),
    WT.chain(() =>
      pipe(inputForMedia, WT.chain(uploadFile(I.imageSystemPath)))
    ),
    WT.chain(() => pipe(buttonForNextOperation, WT.chain(click()))),
    WT.chain(() =>
      pipe(
        textareaForDescription,
        WT.chain(click()),
        WT.chain(() => keyboard.type(I.description, { delay: 150 }))
      )
    ),
    WT.chain(() => pipe(buttonToShareMedia, WT.chain(click()))),
    WT.chain(() =>
      pipe(
        browser,
        WT.chainTaskK((browser) => () => browser.userAgent()),
        WT.chain((userAgent) =>
          emulate({
            userAgent,
            viewport: {
              width: 800,
              height: 600,
            },
          })
        ),
        WT.chain(() => reload())
      )
    ),
    WT.map(() => undefined),
    WT.orElseStackErrorInfos({
      message: `Failed to post media.`,
      nameOfFunction: "postNewMedia",
      filePath: ABSOLUTE_PATH,
    })
  );
};
// -----------------------------------
// Input
// -----------------------------------
interface Input {
  language: Languages;
  imageSystemPath: string;
  description: string;
}
/**
 *
 */
const settingsByLanguage = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsOfInstagram
>((sets) => ({
  xpathOfButtonForNewPost:
    sets.genericLoggedInPage.elements.buttonForNewPost.XPath,
  xpathOfButtonForNextOperation:
    sets.genericLoggedInPage.elements.buttonForNextOperation.XPath,
  xpathOfButtonToShareMedia:
    sets.genericLoggedInPage.elements.buttonToShareMedia.XPath,
  xpathOfInputToUploadMedia:
    sets.genericLoggedInPage.elements.inputToUploadMedia.XPath,
  xpathOfTextareaForDescription:
    sets.genericLoggedInPage.elements.textareaForDescription.XPath,
}))(settingsByLanguageOfInstagram);
// -----------------------------------
// Program
// -----------------------------------
export const postNewMedia = (I: Input) =>
  bodyOfPostNewMedia({
    ...I,
    settings: settingsByLanguage(I.language),
  });
