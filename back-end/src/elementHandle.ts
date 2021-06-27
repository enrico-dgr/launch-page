/**
 * @since 1.0.0
 */
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { pipe, Predicate } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import path from 'path';
import { ClickOptions, ElementHandle, EvaluateFn, SerializableOrJSHandle } from 'puppeteer';

import { anyToError } from './ErrorInfos';
import { WebDeps } from './WebDeps';
import * as WP from './WebProgram';

const PATH = path.resolve(__filename);
/**
 * @since 1.0.0
 */
export const click: (
  options?: ClickOptions | undefined
) => (el: ElementHandle<Element>) => WP.WebProgram<void> = (options) => (el) =>
  WP.fromTaskK(() => () => el.click(options))();
/**
 * @since 1.0.0
 */
export const evaluateClick: (
  el: ElementHandle<Element>
) => WP.WebProgram<void> = (el) =>
  WP.fromTaskK(() => () => el.evaluate((el: HTMLElement) => el.click()))();
/**
 * @since 1.0.0
 */
export const getProperty = <T = never, El extends Element = never>(
  property: keyof El
) => (el: ElementHandle<Element>): WP.WebProgram<O.Option<T>> =>
  WP.fromTaskEither(() =>
    el
      .getProperty(String(property))
      .then((jsh) => jsh?.jsonValue<T>())
      .then((json) =>
        json === undefined
          ? E.right(O.none)
          : E.right<Error, O.Option<T>>(O.some(json))
      )
      .catch((err) => anyToError(err))
  );
/**
 * @since 1.0.0
 */
export type QualifiedAttributeName = "aria-label";
/**
 * @since 1.0.0
 */
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
 * @since 1.0.0
 */
export const getAttribute = <El extends Element = never>(
  qualifiedAttributeName: QualifiedAttributeName
) => (el: ElementHandle<Element>): WP.WebProgram<O.Option<string>> =>
  WP.fromTaskEither(() =>
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
      .catch((err) => anyToError(err))
  );
/**
 * @since 1.0.0
 */
export const getPropertyOrAttribute = <T = never, El extends Element = never>(
  property: keyof El | QualifiedAttributeName
) => (el: ElementHandle<Element>): WP.WebProgram<O.Option<T | string>> =>
  pipe(
    isQualifiedAttributeName(property)
      ? getAttribute(property)(el)
      : getProperty(property)(el)
  );
/**
 * @since 1.0.0
 */
export const getInnerText = getProperty<string>("innerText");
/**
 * @since 1.0.0
 */
export const getHref = getProperty<string, HTMLAnchorElement>("href");
/**
 * @since 1.0.0
 */
export const expectedLength: (
  predicate: Predicate<number>
) => (
  errorObject: (els: ElementHandle<Element>[], r: WebDeps) => Object
) => (
  els: ElementHandle<Element>[]
) => WP.WebProgram<ElementHandle<Element>[]> = (
  predicate: Predicate<number>
) => (errorObject) => (els) =>
  pipe(
    WP.ask(),
    WP.chain((r) =>
      predicate(els.length)
        ? WP.of(undefined)
        : WP.leftFromErrorInfos<ElementHandle<Element>[]>({
            message: JSON.stringify(errorObject(els, r)),
            nameOfFunction: "expectedLength",
            filePath: PATH,
          })
    ),
    WP.chain(() => WP.of(els))
  );
/**
 * @deprecated
 * use fp-ts/Array instead.
 * @since 1.0.0
 */
export const isNElementArray: (
  howMany: (n: number) => boolean
) => (
  errorMessage: (els: ElementHandle<Element>[], r: WebDeps) => string
) => (
  els: ElementHandle<Element>[]
) => WP.WebProgram<ElementHandle<Element>[]> = (
  howMany: (n: number) => boolean
) => (errorMessage) => (els) =>
  pipe(
    WP.ask(),
    WP.chain((r) =>
      pipe(
        r,
        WP.fromPredicate(
          () => howMany(els.length),
          () => new Error(errorMessage(els, r))
        )
      )
    ),
    WP.chain(() => WP.of(els))
  );
/**
 * @deprecated
 * use fp-ts/Array instead.
 * @since 1.0.0
 */
export const isOneElementArray = isNElementArray((n) => n === 1);
/**
 * @deprecated
 * use fp-ts/Array instead.
 * @since 1.0.0
 */
export const isZeroElementArray = isNElementArray((n) => n === 0);
/**
 * @since 1.0.0
 */
export const evaluate = <T extends EvaluateFn<any>>(
  pageFunction: string | T,
  ...args: SerializableOrJSHandle[]
) => (el: ElementHandle<Element>) =>
  pipe(
    el.evaluate(pageFunction, ...args),
    (prom) => () => () => prom,
    WP.fromTaskK
  )();

/**
 * @since 1.0.0
 */
export const $x = (XPath: string) => (
  el: ElementHandle<Element>
): WP.WebProgram<ElementHandle<Element>[]> =>
  WP.fromTaskEither(() =>
    el
      .$x(XPath)
      .then((els) => (els !== undefined ? E.right(els) : E.right([])))
      .catch((err) => anyToError(err))
  );

/**
 * @since 1.0.0
 */
export const type: (
  text: string,
  options?: { delay: number }
) => (el: ElementHandle<Element>) => WP.WebProgram<void> = (text, options) => (
  el
) =>
  WP.fromTaskEither(() =>
    el
      .type(text, options)
      .then(() => E.right(undefined))
      .catch((err) => anyToError(err))
  );

/**
 * @deprecated use HTMLElementProperties
 * @since 1.0.0
 */
export type ElementProps<El extends Element, A> = [
  keyof El | QualifiedAttributeName,
  A | string
][];

/**
 * @category type
 * @since 1.0.0
 */
type XPathResult = "Found" | "NotFound";
/**
 * @category type
 * @since 1.0.0
 */
export type RelativeXPath = {
  xpath: string;
};
/**
 * @category user type guard
 * @since 1.0.0
 */
export const isRelativePath = (
  relativeXPath: any
): relativeXPath is RelativeXPath => {
  const { xpath } = relativeXPath;
  if (typeof xpath === "string" && xpath.match(/^\.\//) !== null) {
    return true;
  } else return false;
};
/**
 * @category Util
 * @since 1.0.0
 */
export const tellIfRelativeXPathExists = (relativeXPath: RelativeXPath) => (
  el: ElementHandle<Element>
) =>
  pipe(
    $x(relativeXPath.xpath)(el),
    WP.map(A.isEmpty),
    WP.map((b) =>
      b ? O.some<XPathResult>("NotFound") : O.some<XPathResult>("Found")
    )
  );
/**
 * @category type
 * @since 1.0.0
 */
export type HTMLElementProperties<El extends Element, A> = (
  | [keyof El | QualifiedAttributeName, A | string]
  | [RelativeXPath, XPathResult]
)[];
/**
 * @category Util
 * @since 1.0.0
 */
const matchOnFirstProp = <El extends Element, A>(
  expectedProps: HTMLElementProperties<El, A>
) => (el: ElementHandle<Element>): WP.WebProgram<O.Option<A | string>> => {
  if (isQualifiedAttributeName(expectedProps[0][0])) {
    return getAttribute<El>(expectedProps[0][0])(el);
  } else if (isRelativePath(expectedProps[0][0])) {
    return tellIfRelativeXPathExists(expectedProps[0][0])(el);
  } else {
    return getProperty<A, El>(expectedProps[0][0])(el);
  }
};

const recursivelyCheckHTMLProperties = <El extends Element, A>(
  expectedProps: HTMLElementProperties<El, A>
) => (el: ElementHandle<El>) => (
  wrongProps: HTMLElementProperties<El, A>
): WP.WebProgram<HTMLElementProperties<El, A>> =>
  expectedProps.length > 0
    ? pipe(
        matchOnFirstProp<El, A>(expectedProps)(el),
        WP.chain<O.Option<A | string>, HTMLElementProperties<El, A>>(
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
    : WP.of(wrongProps);

/**
 * Check all properties to match with `expectedProps`
 * @param expectedProps
 * @returns unmatched `expectedProps`
 * @category Util
 * @since 1.0.0
 */
export const checkHTMLProperties = <El extends Element, A>(
  expectedProps: HTMLElementProperties<El, A>
) => (el: ElementHandle<El>): WP.WebProgram<HTMLElementProperties<El, A>> =>
  recursivelyCheckHTMLProperties(expectedProps)(el)([]);

const recursivelyCheckHTMLPropertiesFromSets = <El extends Element, A>(
  setsOfExpectedProps: HTMLElementProperties<El, A>[]
) => (el: ElementHandle<El>) => (
  setsOfWrongProps: HTMLElementProperties<El, A>[]
): WP.WebProgram<HTMLElementProperties<El, A>[]> =>
  setsOfExpectedProps.length > 0
    ? pipe(
        checkHTMLProperties(setsOfExpectedProps[0])(el),
        WP.chain((wrongProps) =>
          recursivelyCheckHTMLPropertiesFromSets(setsOfExpectedProps.slice(1))(
            el
          )([...setsOfWrongProps, wrongProps])
        )
      )
    : WP.of(setsOfWrongProps);
/**
 * @since 1.0.0
 */
export const checkHTMLPropertiesFromSets = <El extends Element, A>(
  setsOfExpectedProps: HTMLElementProperties<El, A>[]
) => (el: ElementHandle<El>): WP.WebProgram<HTMLElementProperties<El, A>[]> =>
  recursivelyCheckHTMLPropertiesFromSets(setsOfExpectedProps)(el)([]);
/**
 * @returns
 * - array of empty array if one set has a good match
 * - array of wrong HTMLElementProperties<El,A> in the corresponding
 * order of the input
 * e.g.
 * @example
 * import * as WP from '../../src/WebProgram';
 * import * as WD from '../../src/WebDeps';
 * import { matchOneSetOfHTMLProperties } from '../../src/ElementHandle';
 * import { pipe } from 'fp-ts/lib/function';
 * // ↓-- bad result
 * pipe(
 *  WD.$x("//xpath"),
 *  WP.chain((els) =>
 *    matchOneSetOfHTMLProperties<HTMLElement, string>([
 *      [["innerText", "some wrong text"]],
 *    ])(els[0])
 *  ),
 *  WP.map(
 *    // first set of props ----↓  ↓---- first prop
 *    (wrongSets) => wrongSets[0][0]
 *  ),
 *  WP.map(console.log) // output -> ['innerText','some wrong text']
 * );
 * // ↓-- bad result
 * pipe(
 *  WD.$x("//xpath"),
 *  WP.chain((els) =>
 *    matchOneSetOfHTMLProperties<HTMLElement, string>([
 *      [
 *        ["innerHTML", "..."],
 *        [{ xpath: "./someWrongRelativeXPath" }, "Found"],
 *      ],
 *    ])(els[0])
 *  ),
 *  WP.map(
 *    // first set of props ----↓  ↓---- second prop
 *    (wrongSets) => wrongSets[0][1]
 *  ),
 *  WP.map(console.log) // output -> ["./someWrongRelativeXPath","Found"]
 * );
 * // ↓-- good result
 * pipe(
 *  WD.$x("//xpath"),
 *  WP.chain((els) =>
 *    matchOneSetOfHTMLProperties<HTMLElement, string>([
 *      [["innerText", "some good text"]],
 *    ])(els[0])
 *  ),
 *  WP.map((wrongSets) => wrongSets),
 *  WP.map(console.log) // output -> [[]]
 * );
 * @since 1.0.0
 */
export const matchOneSetOfHTMLProperties = <El extends Element, A>(
  setsOfExpectedProps: HTMLElementProperties<El, A>[]
) => (el: ElementHandle<El>): WP.WebProgram<HTMLElementProperties<El, A>[]> =>
  pipe(
    checkHTMLPropertiesFromSets<El, A>(setsOfExpectedProps)(el),
    WP.map((setsOfWrongProps) =>
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
 * @since 1.0.0
 */
export const uploadFile: (
  ...filePaths: string[]
) => (el: ElementHandle<Element>) => WP.WebProgram<void> = (...filePaths) => (
  el
) =>
  WP.fromTaskEither(() =>
    el
      .uploadFile(...filePaths)
      .then(() => E.right<Error, void>(undefined))
      .catch((err) => anyToError(err))
  );
