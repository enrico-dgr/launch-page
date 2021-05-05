export interface Good<A> {
  type: "good";
  value: A;
}
export interface Bad {
  type: "bad";
  err: Error;
}

export type GoodBad<A> = Good<A> | Bad;
export const good = <A>(res: A): Good<A> => ({ type: "good", value: res });
export const bad = (err: Error): Bad => ({ type: "bad", err: err });
export type PromiseGoodBad<B> = Promise<GoodBad<B>>;
