import { get } from 'src/WebTeer/Bot';

import {
    BasicFollowDeps, ByElementDeps, ByElementResult, Followed, match as match_, NotFollowed, Private
} from '../ByElement';
import { conclusion } from './conclusion';
// import { conclusion } from './conclusion';
import { init } from './init';
import { main } from './main';

/**
 * init
 */
export interface OnProfilePageDeps extends BasicFollowDeps {}
/**
 * main
 */
export interface ByElementDeps_Extended extends ByElementDeps, Private {}
/**
 * conclusion
 */
export interface ByElementResult_Extended extends Private {
  result: ByElementResult;
}

/**
 *
 */
export const onProfilePage = get<
  OnProfilePageDeps,
  ByElementDeps_Extended,
  ByElementResult_Extended,
  ByElementResult_Extended
>({
  init: init,
  main: main,
  conclusion: conclusion,
});
