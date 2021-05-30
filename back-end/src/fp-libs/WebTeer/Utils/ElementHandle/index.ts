import { ElementHandle } from "puppeteer";
import * as WebTeer from "../../index";
import * as E from "fp-ts/Either";
import * as RTE from "fp-ts/ReaderTaskEither";
import {} from "fp-ts";
import { pipe } from "fp-ts/lib/function";
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
      .evaluate((el: HTMLButtonElement) => el.click())
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
export const isNElementArray = (n: number) => (
  errorMessage: (els: ElementHandle<Element>[], r: WebTeer.WebDeps) => string
) => (els: ElementHandle<Element>[]) =>
  pipe(
    WebTeer.ask(),
    WebTeer.chain((r) =>
      pipe(
        r,
        WebTeer.fromPredicate(
          () => els.length === 1,
          () => new Error(errorMessage(els, r))
        )
      )
    ),
    WebTeer.chain(() => WebTeer.of(els))
  );
export const isOneElementArray = isNElementArray(1);
export const isZeroElementArray = isNElementArray(0);
