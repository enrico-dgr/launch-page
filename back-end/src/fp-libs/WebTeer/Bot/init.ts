import { flow } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';

/**
 * Deps
 */
interface Deps<I, M> {
  do: (i: I) => WT.WebProgram<M>;
  checksAfterDo: (m: M) => WT.WebProgram<void>[];
}
/**
 * Get
 */
type Get = <I, M>(D: Deps<I, M>) => (i: I) => WT.WebProgram<M>;
/**
 * get function
 */
const get: Get = (D) =>
  flow(
    D.do,
    WT.chainFirst(flow(D.checksAfterDo, WT.chainArray<void>(WT.of(undefined))))
  );
/**
 * exports
 */
export { Deps, Get, get };
