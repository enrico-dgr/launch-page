import { flow } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';

/**
 * Deps
 */
interface Deps<C, F> {
  do: (c: C) => WT.WebProgram<F>;
  checksAfterDo: (f: F) => WT.WebProgram<void>[];
}
/**
 * Get
 */
type Get = <C, F>(D: Deps<C, F>) => (c: C) => WT.WebProgram<F>;
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
