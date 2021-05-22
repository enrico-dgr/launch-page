import { ElementHandle } from "puppeteer";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as RTE from "fp-ts/ReaderTaskEither";
import {} from "fp-ts";
import { pipe } from "fp-ts/lib/function";

export const click: RTE.ReaderTaskEither<
  ElementHandle<Element>,
  Error,
  void
> = pipe(
  RTE.ask<ElementHandle<Element>, Error>(),
  RTE.chainTaskEitherK((el) => () =>
    el
      .evaluate((el: HTMLButtonElement) => el.click())
      .then(E.right)
      .catch((err) =>
        err instanceof Error
          ? E.left(err)
          : E.left(new Error(JSON.stringify(err)))
      )
  )
);
