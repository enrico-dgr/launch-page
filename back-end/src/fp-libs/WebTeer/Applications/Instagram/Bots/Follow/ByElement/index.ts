import { ElementHandle } from 'puppeteer';
import { get } from 'WebTeer/Bot';

import { conclusion } from './conclusion';
import { init } from './init';
import { main } from './main';

/**
 * intro type
 */
export interface BasicFollowDeps {
  allowFollowPrivate: boolean;
  /**
   * with it-lang should be *Segui*
   */
  expectedButtonText: string;
}
export interface ByElementDeps extends BasicFollowDeps {
  el: ElementHandle<HTMLButtonElement>;
}
/**
 * outro type
 */
export interface tag {
  _tag: string;
}
export interface Private {
  private: boolean;
}
export interface Followed extends tag {
  _tag: "Followed";
}
export interface NotFollowed extends tag {
  _tag: "NotFollowed";
}
export type ByElementResult = Followed | NotFollowed;
/**
 * instances
 */
export const followed: Followed = { _tag: "Followed" };
export const notFollowed: NotFollowed = { _tag: "NotFollowed" };
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
