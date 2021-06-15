import { flow, pipe } from 'fp-ts/lib/function';
import * as WT from 'src/index';

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
const get: Get = <C, F>(D: Deps<C, F>) =>
  flow(
    D.do,
    WT.chainFirst<F, void>((f) =>
      pipe(
        D.checksAfterDo(f).map((fn) => () => fn),
        WT.chainArray<void>(() => WT.of(undefined))
      )()
    )
  );
/**
 * exports
 */
export { Deps, Get, get };
