import { pipe } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';
import { goto } from 'WebTeer/Utils/WebDeps';

import {
    clickFollowButton, LanguageSettingKeys, languageSettings, Options as OptionsCFBO
} from '../ClickFollowButton';

export { languageSettings };
interface Options extends OptionsCFBO {
  /**
   * on *true* allows private profiles to be followed
   */
  allowPrivate: boolean;
}
export interface FollowUserInput {
  profileUrl: URL;
  language: LanguageSettingKeys;
  options: Options;
}
export const followUser = (I: FollowUserInput) =>
  pipe(
    WT.asks((r) => r.page.url() === I.profileUrl.href),
    WT.chain((isOnPage) =>
      isOnPage ? WT.of(undefined) : goto(I.profileUrl.href)
    ),
    WT.chain(WT.delay(1000))
  );
