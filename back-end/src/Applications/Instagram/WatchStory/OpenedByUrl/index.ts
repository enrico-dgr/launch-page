import { ElementHandle } from 'puppeteer';
import { get } from 'src/deprecated';

import { MaxStories, StoryStats } from '../ByElement';
import { conclusion } from './conclusion';
import { init } from './Init';
import { main } from './main';

export interface Permission_MaxStories extends MaxStories {
  /**
   * with lang-it should be 'Visualizza la storia'
   */
  permissionButtonText: string;
}
/**
 * MainType
 */

interface tag {
  _tag: string;
}
interface Shown extends tag, MaxStories {
  _tag: "Shown";
  buttonNext: ElementHandle<HTMLButtonElement>;
  maxStories: number;
}
interface NotShown extends tag, MaxStories {
  _tag: "NotShown";
  maxStories: number;
}

export type TransitionType = Shown | NotShown;

export const matchTransitionType = <A>(
  onShown: (shown: Shown) => A,
  onNotShown: (nowShown: NotShown) => A
) => (mt: TransitionType) => {
  switch (mt._tag) {
    case "Shown":
      return onShown(mt);

    case "NotShown":
      return onNotShown(mt);

    default:
      throw new Error("Impossible case matchMainType");
  }
};
/**
 * ConclusionType
 */

interface Viewed extends tag, StoryStats {
  _tag: "Viewed";
}
interface NotViewed extends tag, StoryStats {
  _tag: "NotViewed";
}
export type Result_StoryStats = Viewed | NotViewed;
export const match = <A>(
  onViewed: (f: Viewed) => A,
  onNotViewed: (nf: NotViewed) => A
) => (ma: Result_StoryStats) => {
  switch (ma._tag) {
    case "Viewed":
      return onViewed(ma);
    case "NotViewed":
      return onNotViewed(ma);
    default:
      throw new Error(
        "Impossible match in WatchStory/OpenedByUrl/index -> match"
      );
  }
};
/**
 * When opened by an url, instagram asks for permission
 * to see the story with the logged profile.
 * The permission is given by clicking the button.
 */
export const openedByUrl = get<
  Permission_MaxStories,
  TransitionType,
  Result_StoryStats,
  Result_StoryStats
>({
  init: init,
  main: main,
  conclusion: conclusion,
});
