import { flow } from 'fp-ts/lib/function';
import * as WT from 'WebTeer/index';

/**
 * GetBotDeps
 */
interface Deps<I, M, C, F> {
  init: (i: I) => WT.WebProgram<M>;
  main: (m: M) => WT.WebProgram<C>;
  clean: (c: C) => WT.WebProgram<F>;
}
/**
 * GetBot
 */
type Get = <I, M, C, F>(D: Deps<I, M, C, F>) => (i: I) => WT.WebProgram<F>;
/**
 * getBot function
 */
const get: Get = (D) => flow(D.init, WT.chain(D.main), WT.chain(D.clean));
export { Deps, Get, get };
