import { test } from './test';
import { int } from './int';

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

  export type ToArray<U, T = U, TResult extends T[] = []> = Pop<U> extends {
    next: infer INext extends T;
    rest: infer IRest extends T;
  }
    ? ToArray<IRest, T, [INext, ...TResult]>
    : TResult;

  declare const testToArray: test.Describe<
    test.Expect<ToArray<never>, []>,
    test.Expect<ToArray<'a'>, ['a']>,
    test.Expect<ToArray<'a' | 'b' | 'c'>, ['a', 'b', 'c']>,
    test.Expect<ToArray<string | number>, [string, number]>
  >;

  type RangeImpl<TA extends number, TLen extends number> = TLen extends 0
    ? never
    : TA | RangeImpl<int.Inc<TA>, int.Dec<TLen>>;
  export type Range<TA extends number, TB extends number> = int.Compare<TA, TB> extends 'gt'
    ? Range<TB, TA>
    : RangeImpl<TA, int.Inc<int.Subtract<TB, TA>>>;

  declare const testRange: test.Describe<
    test.Expect<Range<0, 0>, 0>,
    test.Expect<Range<0, 2>, 0 | 1 | 2>,
    test.Expect<Range<2, 4>, 2 | 3 | 4>,
    test.Expect<Range<4, 2>, 2 | 3 | 4>
  >;

  type MinMax<
    N extends number,
    TOp extends 'lt' | 'gt',
    TCurrent extends number | undefined = undefined,
    TPop = union.Pop<N>,
  > = TPop extends {
    rest: infer IRest extends number;
    next: infer INext extends number;
  }
    ? MinMax<
        IRest,
        TOp,
        undefined extends TCurrent
          ? INext
          : int.Compare<INext, TCurrent & number> extends TOp
          ? INext
          : TCurrent
      >
    : TCurrent;

  export type Min<N extends number> = MinMax<N, 'lt'>;
  export type Max<N extends number> = MinMax<N, 'gt'>;

  declare const testMin: test.Describe<
    test.Expect<Min<5 | 2 | 3>, 2>,
    test.Expect<Min<-5 | -12345 | 123456 | 123>, -12345>,
    test.Expect<Min<0>, 0>
  >;

  declare const testMax: test.Describe<
    test.Expect<Max<5 | 2 | 3>, 5>,
    test.Expect<Max<-5 | -12345 | 123456 | 123>, 123456>,
    test.Expect<Max<0>, 0>
  >;
}
