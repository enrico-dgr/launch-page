import { ElementHandle } from 'puppeteer';
import { get } from 'src/WebTeer/Bot';

import { conclusion } from './conclusion';
import { init } from './init';
import { main } from './main';

/**
 * intro type
 */
export interface BasicLikeDeps {
  /**
   * with it-lang should be *Mi piace*
   */
  expectedLikeButtonSvgArialabel: string;
  expectedUnLikeButtonSvgArialabel?: string;
}
export interface ByElementDeps extends BasicLikeDeps {
  el: ElementHandle<HTMLButtonElement>;
}
/**
 * outro type
 */
export interface tag {
  _tag: string;
}

export interface Liked extends tag {
  _tag: "Liked";
}
export interface NotLiked extends tag {
  _tag: "NotLiked";
}

export type ByElementResult = Liked | NotLiked;
/**
 * instances
 */
export const liked: Liked = { _tag: "Liked" };
export const notLiked: NotLiked = { _tag: "NotLiked" };
/**
 *
 */
export const match = <A>(
  onLiked: (f: Liked) => A,
  onNotLiked: (nf: NotLiked) => A
) => (ma: ByElementResult) => {
  switch (ma._tag) {
    case "Liked":
      return onLiked(ma);
    case "NotLiked":
      return onNotLiked(ma);
    default:
      throw new Error("Impossible match in Like/ByElement/index -> match");
  }
};
/**
 * m
 */

/**
 *
 */
export const byElement = get<
  ByElementDeps,
  ByElementDeps,
  ByElementDeps,
  ByElementResult
>({
  init: init,
  main: main,
  conclusion: conclusion,
});
