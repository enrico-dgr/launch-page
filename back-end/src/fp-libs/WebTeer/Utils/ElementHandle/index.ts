import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { flow, pipe, Predicate } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as RTE from 'fp-ts/ReaderTaskEither';
import { ElementHandle, EvaluateFn, SerializableOrJSHandle } from 'puppeteer';

import * as WT from '../../index';

/**
 * @deprecated
 */
export const oldClick: RTE.ReaderTaskEither<
  ElementHandle<Element>,
  Error,
  void
> = pipe(
  RTE.ask<ElementHandle<Element>, Error>(),
  RTE.chainTaskEitherK((el) => () =>
    el
      .evaluate((el: HTMLButtonElement) => el.click())
      .then(E.right)
      .catch((err) => E.left(WT.anyToError(err)))
  )
);

export const click: (el: ElementHandle<Element>) => WT.WebProgram<void> = (
  el
) => WT.fromTaskK(() => () => el.click())();

export const evaluateClick: (
  el: ElementHandle<Element>
) => WT.WebProgram<void> = (el) =>
  WT.fromTaskK(() => () => el.evaluate((el: HTMLElement) => el.click()))();

export const getProperty = <T = never, El extends Element = never>(
  property: keyof El
) => (el: ElementHandle<Element>): WT.WebProgram<O.Option<T>> =>
  WT.fromTaskEither(() =>
    el
      .getProperty(String(property))
      .then((jsh) => jsh?.jsonValue<T>())
      .then((json) =>
        json === undefined
          ? E.right(O.none)
          : E.right<Error, O.Option<T>>(O.some(json))
      )
      .catch((err) => E.left(WT.anyToError(err)))
  );
export const getInnerText = getProperty<string>("innerText");
export const getHref = getProperty<string, HTMLAnchorElement>("href");
/**
 *
 */
export const expectedLength: (
  predicate: Predicate<number>
) => (
  errorObject: (els: ElementHandle<Element>[], r: WT.WebDeps) => Object
) => (
  els: ElementHandle<Element>[]
) => WT.WebProgram<ElementHandle<Element>[]> = (
  predicate: Predicate<number>
) => (errorObject) => (els) =>
  pipe(
    WT.ask(),
    WT.chain((r) =>
      pipe(
        r,
        WT.fromPredicate(
          () => predicate(els.length),
          () => new Error(JSON.stringify(errorObject(els, r)))
        )
      )
    ),
    WT.chain(() => WT.of(els))
  );
/**
 * @deprecated
 * use fp-ts/Array instead.
 */
export const isNElementArray: (
  howMany: (n: number) => boolean
) => (
  errorMessage: (els: ElementHandle<Element>[], r: WT.WebDeps) => string
) => (
  els: ElementHandle<Element>[]
) => WT.WebProgram<ElementHandle<Element>[]> = (
  howMany: (n: number) => boolean
) => (errorMessage) => (els) =>
  pipe(
    WT.ask(),
    WT.chain((r) =>
      pipe(
        r,
        WT.fromPredicate(
          () => howMany(els.length),
          () => new Error(errorMessage(els, r))
        )
      )
    ),
    WT.chain(() => WT.of(els))
  );
/**
 * @deprecated
 * use fp-ts/Array instead.
 */
export const isOneElementArray = isNElementArray((n) => n === 1);
/**
 * @deprecated
 * use fp-ts/Array instead.
 */
export const isZeroElementArray = isNElementArray((n) => n === 0);
export const evaluate = <T extends EvaluateFn<any>>(
  pageFunction: string | T,
  ...args: SerializableOrJSHandle[]
) => (el: ElementHandle<Element>) =>
  pipe(
    el.evaluate(pageFunction, ...args),
    (prom) => () => () => prom,
    WT.fromTaskK
  )();
/**
 * @description
 * @param has ...
 * - If *true*, you expect text to be found in innerText.
 * - If *false*, you don't want the text to be in the innerText.
 * @returns - right(undefined) if the *has* condition has been respected.
 * - left(errorMessage) otherwise.
 * @deprecated
 * use `checkProperties` instead
 */
export const innerTextMatcher = (has: boolean) => (
  text: string,
  errorMessage: (el: ElementHandle<Element>, deps: WT.WebDeps) => string
) => (this_el: ElementHandle<Element>) =>
  pipe(
    this_el,
    getProperty<string>("innerText"),
    WT.chain((innerText) =>
      pipe(
        WT.ask(),
        WT.chain((r) =>
          WT.fromPredicate(
            () =>
              O.match<string, boolean>(
                () => false,
                (a) => (a.search(text) > -1 ? has : !has)
              )(innerText),
            () => new Error(errorMessage(this_el, r))
          )(undefined)
        )
      )
    ),
    WT.chain(() => WT.of(this_el))
  );
/**
 *
 */
export const $x = (XPath: string) => (
  el: ElementHandle<Element>
): WT.WebProgram<ElementHandle<Element>[]> =>
  WT.fromTaskEither(() =>
    el
      .$x(XPath)
      .then((els) => (els !== undefined ? E.right(els) : E.right([])))
      .catch((err) => E.left(WT.anyToError(err)))
  );

/**
 * @deprecated
 */
export const exists: (
  el: ElementHandle<Element>
) => WT.WebProgram<boolean> = flow(
  getInnerText,
  WT.chain(
    O.match(
      () => WT.of(false),
      () => WT.of<boolean>(true)
    )
  ),
  WT.orElse(() => WT.of<boolean>(false))
);
/**
 * @deprecated
 */
export const type: (
  text: string,
  options?: { delay: number }
) => (el: ElementHandle<Element>) => WT.WebProgram<void> = (text, options) => (
  el
) =>
  WT.fromTaskEither(() =>
    el
      .type(text, options)
      .then(() => E.right(undefined))
      .catch((err) => E.left(WT.anyToError(err)))
  );

/**
 *
 */
export type ElementProps<El extends Element, A> = [keyof El, A][];

const checkProperties_Recur = <El extends Element, A>(
  expectedProps: ElementProps<El, A>
) => (el: ElementHandle<El>) => (
  wrongProps: ElementProps<El, A>
): WT.WebProgram<ElementProps<El, A>> =>
  expectedProps.length > 0
    ? pipe(
        getProperty<A, El>(expectedProps[0][0])(el),
        WT.chain((a) =>
          O.match(
            () =>
              checkProperties_Recur(expectedProps.slice(1))(el)([
                ...wrongProps,
                expectedProps[0],
              ]),
            (val) =>
              val === expectedProps[0][1]
                ? checkProperties_Recur(expectedProps.slice(1))(el)(wrongProps)
                : checkProperties_Recur(expectedProps.slice(1))(el)([
                    ...wrongProps,
                    expectedProps[0],
                  ])
          )(a)
        )
      )
    : WT.of(wrongProps);

/**
 * Check all properties to match with `expectedProps`
 * @param expectedProps
 * @returns unmatched `expectedProps`
 */
export const checkProperties = <El extends Element, A>(
  expectedProps: ElementProps<El, A>
) => (el: ElementHandle<El>): WT.WebProgram<ElementProps<El, A>> =>
  checkProperties_Recur(expectedProps)(el)([]);
/**
 *
 */
const checkPropertiesFromSets_Recur = <El extends Element, A>(
  setsOfExpectedProps: ElementProps<El, A>[]
) => (el: ElementHandle<El>) => (
  setsOfWrongProps: ElementProps<El, A>[]
): WT.WebProgram<ElementProps<El, A>[]> =>
  setsOfExpectedProps.length > 0
    ? pipe(
        checkProperties(setsOfExpectedProps[0])(el),
        WT.chain((wrongProps) =>
          checkPropertiesFromSets_Recur(setsOfExpectedProps.slice(1))(el)([
            ...setsOfWrongProps,
            wrongProps,
          ])
        )
      )
    : WT.of(setsOfWrongProps);
export const checkPropertiesFromSets = <El extends Element, A>(
  setsOfExpectedProps: ElementProps<El, A>[]
) => (el: ElementHandle<El>): WT.WebProgram<ElementProps<El, A>[]> =>
  checkPropertiesFromSets_Recur(setsOfExpectedProps)(el)([]);
/**
 * @returns
 * - array of empty array if one set has a good match
 * - array of wrong ElementProps<El,A> in the corresponding
 * order of the input
 * e.g.
 * @example
 * // ↓-- bad result
 * pipe(
 *  matchOneSetOfProperties([[["innerText","some wrong text"]]]),
 *  WT.map(
 * // first set of props ----↓  ↓---- first prop
 *    wrongSets => wrongSets[0][0]
 *  ),
 *  WT.map(
 *    console.log
 *  ) // output -> ['innerText','some wrong text']
 * );
 * // ↓-- good result
 * pipe(
 *  matchOneSetOfProperties([[["innerText","some good text"]]]),
 *  WT.map(
 *    wrongSets => wrongSets
 *  ),
 *  WT.map(
 *    console.log
 *  ) // output -> [[]]
 * );
 *
 */
export const matchOneSetOfProperties = <El extends Element, A>(
  setsOfExpectedProps: ElementProps<El, A>[]
) => (el: ElementHandle<El>): WT.WebProgram<ElementProps<El, A>[]> =>
  pipe(
    checkPropertiesFromSets<El, A>(setsOfExpectedProps)(el),
    WT.map((setsOfWrongProps) =>
      pipe(
        A.findFirst(A.isEmpty)(setsOfWrongProps),
        O.match(
          () => setsOfWrongProps,
          (a_) => [[]]
        )
      )
    )
  );
/**
 *  -----------------------------------------------------
 */
