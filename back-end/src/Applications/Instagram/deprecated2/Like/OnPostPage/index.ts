import { get } from 'src/WebTeer/Bot';

import { BasicLikeDeps, ByElementDeps, ByElementResult } from '../ByElement';
import { conclusion } from './conclusion';
// import { conclusion } from './conclusion';
import { init } from './init';
import { main } from './main';

/**
 * init
 */
export interface OnPostPageDeps extends BasicLikeDeps {}
/**
 * main
 */
export type MiddleType = {
  byElementDeps: ByElementDeps;
  alreadyLiked: boolean;
};
/**
 *
 */
export type ConclusionType = {
  byElementResult: ByElementResult;
  alreadyLiked: boolean;
};

/**
 *
 */
export const onPostPage = get<
  OnPostPageDeps,
  MiddleType,
  ConclusionType,
  ConclusionType
>({
  init: init,
  main: main,
  conclusion: conclusion,
});
