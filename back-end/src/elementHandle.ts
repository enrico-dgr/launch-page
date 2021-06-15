import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { flow, pipe, Predicate } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as RTE from 'fp-ts/ReaderTaskEither';
import { ElementHandle, EvaluateFn, SerializableOrJSHandle } from 'puppeteer';

import * as WT from './index';

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
/**
 * runs `click` on page's console
 */
export const evaluateClick: (
  el: ElementHandle<Element>
) => WT.WebProgram<void> = (el) =>
  WT.fromTaskK(() => () => el.evaluate((el: HTMLElement) => el.click()))();
/**
 * runs `el.getProperty()`
 */
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
// const isKeyOfEl = <El extends Element>(key:any):key is keyof El=>
// ;

export type QualifiedAttributeName = "aria-label";
export const isQualifiedAttributeName = (
  name: any
): name is QualifiedAttributeName => {
  switch (name) {
    case "aria-label":
      return true;

    default:
      return false;
  }
};
/**
 * get attributes such as *aria-label*
 */
export const getAttribute = <El extends Element = never>(
  qualifiedAttributeName: QualifiedAttributeName
) => (el: ElementHandle<Element>): WT.WebProgram<O.Option<string>> =>
  WT.fromTaskEither(() =>
    el
      .evaluate(
        (el: El, qualifiedAttributeName) =>
          el.getAttribute(qualifiedAttributeName),
        qualifiedAttributeName
      )
      .then((value) =>
        value === null
          ? E.right(O.none)
          : E.right<Error, O.Option<string>>(O.some(value))
      )
      .catch((err) => E.left(WT.anyToError(err)))
  );
/**
 *
 */
export const getPropertyOrAttribute = <T = never, El extends Element = never>(
  property: keyof El | QualifiedAttributeName
) => (el: ElementHandle<Element>): WT.WebProgram<O.Option<T | string>> =>
  pipe(
    isQualifiedAttributeName(property)
      ? getAttribute(property)(el)
      : getProperty(property)(el)
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
export type ElementProps<El extends Element, A> = [
  keyof El | QualifiedAttributeName,
  A | string
][];

const checkProperties_Recur = <El extends Element, A>(
  expectedProps: ElementProps<El, A>
) => (el: ElementHandle<El>) => (
  wrongProps: ElementProps<El, A>
): WT.WebProgram<ElementProps<El, A>> =>
  expectedProps.length > 0
    ? pipe(
        isQualifiedAttributeName(expectedProps[0][0])
          ? getAttribute<El>(expectedProps[0][0])(el)
          : getProperty<A, El>(expectedProps[0][0])(el),
        WT.chain<O.Option<A | string>, ElementProps<El, A>>((a) =>
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
 * @category type
 */
type XPathResult = "Found" | "NotFound";
/**
 * @category type
 */
type RelativeXPath = {
  xpath: string;
};
/**
 * @category user type guard
 */
const isRelativePath = (relativeXPath: any): relativeXPath is RelativeXPath => {
  const { xpath } = relativeXPath;
  if (typeof xpath === "string" && xpath.match(/^\.\//) !== null) {
    return true;
  } else return false;
};
/**
 * @category Util
 */
const tellIfRelativeXPathExists = (relativeXPath: RelativeXPath) => (
  el: ElementHandle<Element>
) =>
  pipe(
    $x(relativeXPath.xpath)(el),
    WT.map(A.isEmpty),
    WT.map((b) =>
      b ? O.some<XPathResult>("NotFound") : O.some<XPathResult>("Found")
    )
  );
/**
 * @category type
 */
export type HTMLElementProperties<El extends Element, A> = (
  | [keyof El | QualifiedAttributeName, A | string]
  | [RelativeXPath, XPathResult]
)[];
/**
 * @category Util
 */
const matchOnFirstProp = <El extends Element, A>(
  expectedProps: HTMLElementProperties<El, A>
) => (el: ElementHandle<Element>): WT.WebProgram<O.Option<A | string>> => {
  if (isQualifiedAttributeName(expectedProps[0][0])) {
    return getAttribute<El>(expectedProps[0][0])(el);
  } else if (isRelativePath(expectedProps[0][0])) {
    return tellIfRelativeXPathExists(expectedProps[0][0])(el);
  } else {
    return getProperty<A, El>(expectedProps[0][0])(el);
  }
};
/**
 * @category Body
 */
const recursivelyCheckHTMLProperties = <El extends Element, A>(
  expectedProps: HTMLElementProperties<El, A>
) => (el: ElementHandle<El>) => (
  wrongProps: HTMLElementProperties<El, A>
): WT.WebProgram<HTMLElementProperties<El, A>> =>
  expectedProps.length > 0
    ? pipe(
        matchOnFirstProp<El, A>(expectedProps)(el),
        WT.chain<O.Option<A | string>, HTMLElementProperties<El, A>>(
          O.match(
            () =>
              recursivelyCheckHTMLProperties(expectedProps.slice(1))(el)([
                ...wrongProps,
                expectedProps[0],
              ]),
            (val) =>
              val === expectedProps[0][1]
                ? recursivelyCheckHTMLProperties(expectedProps.slice(1))(el)(
                    wrongProps
                  )
                : recursivelyCheckHTMLProperties(expectedProps.slice(1))(el)([
                    ...wrongProps,
                    expectedProps[0],
                  ])
          )
        )
      )
    : WT.of(wrongProps);

/**
 * Check all properties to match with `expectedProps`
 * @param expectedProps
 * @returns unmatched `expectedProps`
 * @category Util
 */
export const checkHTMLProperties = <El extends Element, A>(
  expectedProps: HTMLElementProperties<El, A>
) => (el: ElementHandle<El>): WT.WebProgram<HTMLElementProperties<El, A>> =>
  recursivelyCheckHTMLProperties(expectedProps)(el)([]);
/**
 * @category Body
 */
const recursivelyCheckHTMLPropertiesFromSets = <El extends Element, A>(
  setsOfExpectedProps: HTMLElementProperties<El, A>[]
) => (el: ElementHandle<El>) => (
  setsOfWrongProps: HTMLElementProperties<El, A>[]
): WT.WebProgram<HTMLElementProperties<El, A>[]> =>
  setsOfExpectedProps.length > 0
    ? pipe(
        checkHTMLProperties(setsOfExpectedProps[0])(el),
        WT.chain((wrongProps) =>
          recursivelyCheckHTMLPropertiesFromSets(setsOfExpectedProps.slice(1))(
            el
          )([...setsOfWrongProps, wrongProps])
        )
      )
    : WT.of(setsOfWrongProps);
/**
 * @category Util
 */
export const checkHTMLPropertiesFromSets = <El extends Element, A>(
  setsOfExpectedProps: HTMLElementProperties<El, A>[]
) => (el: ElementHandle<El>): WT.WebProgram<HTMLElementProperties<El, A>[]> =>
  recursivelyCheckHTMLPropertiesFromSets(setsOfExpectedProps)(el)([]);
/**
 * @returns
 * - array of empty array if one set has a good match
 * - array of wrong HTMLElementProperties<El,A> in the corresponding
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
 * // ↓-- bad result
 * pipe(
 *  matchOneSetOfProperties([[['...','...'],["./someWrongRelativeXPath","Found"]]]),
 *  WT.map(
 * // first set of props ----↓  ↓---- second prop
 *    wrongSets => wrongSets[0][1]
 *  ),
 *  WT.map(
 *    console.log
 *  ) // output -> ["./someWrongRelativeXPath","Found"]
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
 * @category Util
 */
export const matchOneSetOfHTMLProperties = <El extends Element, A>(
  setsOfExpectedProps: HTMLElementProperties<El, A>[]
) => (el: ElementHandle<El>): WT.WebProgram<HTMLElementProperties<El, A>[]> =>
  pipe(
    checkHTMLPropertiesFromSets<El, A>(setsOfExpectedProps)(el),
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