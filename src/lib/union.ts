import { test } from './test';

export namespace union {
  export type ToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I,
  ) => void
    ? I
    : never;

  export type Pop<U> = ToIntersection<U extends any ? () => U : never> extends () => infer R
    ? { rest: Exclude<U, R>; next: R }
    : undefined;

  export type Size<U, TCounter extends any[] = []> = Pop<U> extends {
    next: any;
    rest: infer IRest;
  }
    ? Size<IRest, [...TCounter, any]>
    : TCounter['length'];

  declare const testSize: test.Describe<
    test.Expect<Size<never>, 0>,
    test.Expect<Size<'a'>, 1>,
    test.Expect<Size<'a' | 'b' | 'c'>, 3>,
    test.Expect<Size<string | number>, 2>
  >;
}
