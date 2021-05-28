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
      .catch(WebTeer.leftAny)
  )
);
export const click = (el: ElementHandle<Element>): WebTeer.WebProgram<void> =>
  RTE.fromTaskEither(() =>
    el
      .evaluate((el: HTMLButtonElement) => el.click())
      .then(E.right)
      .catch(WebTeer.leftAny)
  );

export const getProperty = (el: ElementHandle<Element>) => <T = unknown>(
  property: string
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
      .catch(WebTeer.leftAny)
  );
