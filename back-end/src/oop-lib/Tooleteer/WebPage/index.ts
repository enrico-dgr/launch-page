import { Page, WaitForOptions, HTTPResponse } from "puppeteer";
import * as EH from "./errorHandling";

//
export type gotoOptions = { url: string; options?: WaitForOptions };

/**
 * @description
 * Each method should be created through the
 * `protected static getMethod`.
 *
 * For example:
 * ```
 * brandNewMethod = WebPage.getMethod<A,B>(
 *  f: (
 *    a: A,
 *    good: (b: B) => EH.Good<B>,
 *    bad: (err: Error) => EH.Bad
 *  ) => EH.PromiseGoodBad<B>
 * )
 * ```
 */
export class WebPage {
  constructor(
    readonly page: Page,
    readonly gotoOptions: WaitForOptions = {
      waitUntil: "networkidle0",
    },
    readonly errorLogger?: ((err: Error) => void)[]
  ) {}
  /**
   *
   * @param f
   * ```
   *  f: (
   *    a: A,
   *    good: (b: B) => EH.Good<B>,
   *    bad: (err: Error) => EH.Bad
   *  ) => EH.PromiseGoodBad<B>
   * ```
   * @returns ```
   * (pgba: EH.PromiseGoodBad<A>) => EH.PromiseGoodBad<B>
   * ```
   * **NOTE** `pgba` is **`NOT`** just a `Promise<A>`,
   * it is a `Promise<Good<A> | Bad>`
   * @description checks `pgba` to be non-error and
   * runs the task `f`
   */
  protected static getMethod = <A, B>(
    f: (
      a: A,
      good: (b: B) => EH.Good<B>,
      bad: (err: Error) => EH.Bad
    ) => EH.PromiseGoodBad<B>
  ) => (pgba: EH.PromiseGoodBad<A>): EH.PromiseGoodBad<B> =>
    pgba.then((pv) => {
      switch (pv.type) {
        case "bad":
          return pv;

        case "good":
          return f(pv.value, EH.good, EH.bad);
      }
    });

  goTo = WebPage.getMethod<gotoOptions, HTTPResponse>(
    ({ url, options = this.gotoOptions }, good, bad) =>
      this.page
        .goto(url, options)
        .then((res) => good(res))
        .catch((error) => {
          const err: Error = {
            name: "page.goto => throws error.",
            message: JSON.stringify(error),
          };
          return bad(err);
        })
  );
}
