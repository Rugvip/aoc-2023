import { int } from './math';
import { test } from './test';

export namespace array {
  export type Make<
    TLength extends number = 0,
    TItem = any,
    TCounter extends TItem[] = [],
  > = TCounter['length'] extends TLength ? TCounter : Make<TLength, TItem, [...TCounter, TItem]>;

  declare const testMake: test.Describe<
    test.Expect<Make<0>, []>,
    test.Expect<Make<1, string>, [string]>,
    test.Expect<Make<2, true>, [true, true]>,
    test.Expect<Make<3, 1 | 2 | 3>, [1 | 2 | 3, 1 | 2 | 3, 1 | 2 | 3]>
  >;

  export type MakeCount<
    TLength extends number = 0,
    TStart extends number = 0,
    TCounter extends number[] = [],
  > = TCounter['length'] extends TLength
    ? TCounter
    : MakeCount<
        TLength,
        TStart,
        [...TCounter, TStart extends 0 ? TCounter['length'] : int.Add<TStart, TCounter['length']>]
      >;

  declare const testMakeCount: test.Describe<
    test.Expect<MakeCount<0>, []>,
    test.Expect<MakeCount<1>, [0]>,
    test.Expect<MakeCount<2>, [0, 1]>,
    test.Expect<MakeCount<3>, [0, 1, 2]>,
    test.Expect<MakeCount<0, 5>, []>,
    test.Expect<MakeCount<1, 5>, [5]>,
    test.Expect<MakeCount<2, 5>, [5, 6]>,
    test.Expect<MakeCount<3, 5>, [5, 6, 7]>
  >;

  type IsNegative<T extends number> = `${T}` extends `-${string}` ? true : false;

  export type DropN<
    TArr extends any[],
    TN extends number,
    TDropCounter extends any[] = [],
  > = TDropCounter['length'] extends TN
    ? TArr
    : TArr extends [any, ...infer IRest]
    ? DropN<IRest, TN, [...TDropCounter, any]>
    : [];

  export type TakeN<
    TArr extends any[],
    TN extends number,
    TResult extends any[] = [],
  > = IsNegative<TN> extends true
    ? []
    : TResult['length'] extends TN
    ? TResult
    : TArr extends [infer IHead, ...infer IRest]
    ? TakeN<IRest, TN, [...TResult, IHead]>
    : TResult;

  type Wrap<
    TIndex extends number,
    TLength extends number,
  > = `${TIndex}` extends `-${infer IPositive extends number}`
    ? int.Subtract<TLength, IPositive>
    : TIndex;

  export type Slice<
    TArr extends any[],
    TStart extends number = 0,
    TEnd extends number = TArr['length'],
  > = Wrap<TStart, TArr['length']> extends infer IStart extends number
    ? TakeN<DropN<TArr, IStart>, int.Subtract<Wrap<TEnd, TArr['length']>, IStart>>
    : never;

  declare const testSlice: test.Describe<
    test.Expect<Slice<['a', 'b', 'c', 'd', 'e']>, ['a', 'b', 'c', 'd', 'e']>,
    test.Expect<Slice<['a', 'b', 'c', 'd', 'e'], 2>, ['c', 'd', 'e']>,
    test.Expect<Slice<['a', 'b', 'c', 'd', 'e'], 0, 3>, ['a', 'b', 'c']>,
    test.Expect<Slice<['a', 'b', 'c', 'd', 'e'], 0, 5>, ['a', 'b', 'c', 'd', 'e']>,
    test.Expect<Slice<['a', 'b', 'c', 'd', 'e'], 3, 2>, []>,
    test.Expect<Slice<['a', 'b', 'c', 'd', 'e'], 5>, []>,
    test.Expect<Slice<['a', 'b', 'c', 'd', 'e'], 4>, ['e']>,
    test.Expect<Slice<['a', 'b', 'c', 'd', 'e'], -1>, ['e']>,
    test.Expect<Slice<['a', 'b', 'c', 'd', 'e'], -2>, ['d', 'e']>,
    test.Expect<Slice<['a', 'b', 'c', 'd', 'e'], -3, -1>, ['c', 'd']>,
    test.Expect<Slice<['a', 'b', 'c', 'd', 'e'], -3, 4>, ['c', 'd']>
  >;

  export type Indices<T extends any[]> = Exclude<
    keyof T,
    keyof []
  > extends `${infer I extends number}`
    ? I
    : never;
}
