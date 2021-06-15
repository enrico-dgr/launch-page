import { pipe } from 'fp-ts/lib/function';
import * as WT from 'src/index';

/**
 * Deps
 */
interface MainResult {
  /**
   * *true* if you want *main()* to end and
   * pass to *clean()*
   */
  end: boolean;
}
interface Deps<M, C extends MainResult> {
  checksBeforeDo: (m: M) => WT.WebProgram<void>[];
  do: (m: M) => WT.WebProgram<C>;
  checksAfterDo: (m: M) => WT.WebProgram<void>[];
}
/**
 * Get
 */
type Get = <M, C extends MainResult>(
  D: Deps<M, C>
) => (m: M) => WT.WebProgram<C>;
/**
 * get function
 */
const get: Get = (D) => (m) =>
  pipe(
    pipe(
      D.checksBeforeDo(m).map((fn) => () => fn),
      WT.chainArray<void>(() => WT.of(undefined))
    )(),
    WT.chain(() => D.do(m)),
    WT.chainFirst(() =>
      pipe(
        D.checksAfterDo(m).map((fn) => () => fn),
        WT.chainArray<void>(() => WT.of(undefined))
      )()
    ),
    WT.chain((c) => (c.end ? WT.of(c) : get(D)(m)))
  );
/**
 * exports
 */
export { Deps, Get, get, MainResult };
