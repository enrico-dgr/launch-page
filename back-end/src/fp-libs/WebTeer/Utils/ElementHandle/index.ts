import { ElementHandle, EvaluateFn, SerializableOrJSHandle } from "puppeteer";
import * as WebTeer from "../../index";
import * as E from "fp-ts/Either";
import * as RTE from "fp-ts/ReaderTaskEither";
import {} from "fp-ts";
import { flow, pipe } from "fp-ts/lib/function";
import { fromTaskK } from "fp-ts/lib/TaskEither";
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
      .catch((err) => E.left(WebTeer.anyToError(err)))
  )
);
export const click = (el: ElementHandle<Element>): WebTeer.WebProgram<void> =>
  RTE.fromTaskEither(() =>
    el
      .evaluate((el: HTMLElement) => el.click())
      .then(E.right)
      .catch((err) => E.left(WebTeer.anyToError(err)))
  );

export const getProperty = <T = unknown>(property: string) => (
  el: ElementHandle<Element>
): WebTeer.WebProgram<T> =>
  WebTeer.fromTaskEither(() =>
    el
      .getProperty(property)
      .then((jsh) => jsh?.jsonValue<T>())
      .then((json) =>
        json === undefined
          ? E.left(new Error(`Property of name '${property}', NOT FOUND`))
          : E.right<Error, T>(json)
      )
      .catch((err) => E.left(WebTeer.anyToError(err)))
  );
export const getInnerText = getProperty<string>("innerText");
export const getHref = getProperty<string>("href");
export const isNElementArray: (
  howMany: (n: number) => boolean
) => (
  errorMessage: (els: ElementHandle<Element>[], r: WebTeer.WebDeps) => string
) => (
  els: ElementHandle<Element>[]
) => WebTeer.WebProgram<ElementHandle<Element>[]> = (
  howMany: (n: number) => boolean
) => (errorMessage) => (els) =>
  pipe(
    WebTeer.ask(),
    WebTeer.chain((r) =>
      pipe(
        r,
        WebTeer.fromPredicate(
          () => howMany(els.length),
          () => new Error(errorMessage(els, r))
        )
      )
    ),
    WebTeer.chain(() => WebTeer.of(els))
  );
export const isOneElementArray = isNElementArray((n) => n === 1);
export const isZeroElementArray = isNElementArray((n) => n === 0);
export const evaluate = <T extends EvaluateFn<any>>(
  pageFunction: string | T,
  ...args: SerializableOrJSHandle[]
) => (el: ElementHandle<Element>) =>
  pipe(
    el.evaluate(pageFunction, ...args),
    (prom) => () => () => prom,
    WebTeer.fromTaskK
  );
/**
 * @description
 * @param has ...
 * - If *true*, you expect text to be found in innerText.
 * - If *false*, you don't want the text to be in the innerText.
 * @returns - right(undefined) if the *has* condition has been respected.
 * - left(errorMessage) otherwise.
 */
export const innerTextMatcher = (has: boolean) => (
  text: string,
  errorMessage: (el: ElementHandle<Element>, deps: WebTeer.WebDeps) => string
) => (this_el: ElementHandle<Element>) =>
  pipe(
    this_el,
    getProperty<string>("innerText"),
    WebTeer.chain((innerText) =>
      pipe(
        WebTeer.ask(),
        WebTeer.chain((r) =>
          WebTeer.fromPredicate<string>(
            (innerText_) => (innerText_.search(text) > -1 ? has : !has),
            () => new Error(errorMessage(this_el, r))
          )(innerText)
        )
      )
    ),
    WebTeer.chain(() => WebTeer.of(undefined))
  );
