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

  export type DropN<
    TArr extends any[],
    TN extends number,
    TDropCounter extends any[] = [],
  > = TDropCounter['length'] extends TN
    ? TArr
    : TArr extends [any, ...infer IRest extends any[]]
    ? DropN<IRest, TN, [...TDropCounter, any]>
    : [];

  export type TakeN<
    TArr extends any[],
    TN extends number,
    TResult extends any[] = [],
  > = int.IsNegative<TN> extends true
    ? []
    : TResult['length'] extends TN
    ? TResult
    : TArr extends [infer IHead, ...infer IRest extends any[]]
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

  export type At<TArr extends any[], TIndex extends number> = int.IsNegative<TIndex> extends true
    ? int.Add<TArr['length'], TIndex> extends infer IIndex extends number
      ? int.IsNegative<IIndex> extends true
        ? undefined
        : TArr[IIndex]
      : never
    : TArr[TIndex];

  declare const testAt: test.Describe<
    test.Expect<At<['a', 'b', 'c'], 0>, 'a'>,
    test.Expect<At<['a', 'b', 'c'], 1>, 'b'>,
    test.Expect<At<['a', 'b', 'c'], 2>, 'c'>,
    test.Expect<At<['a', 'b', 'c'], 3>, undefined>,
    test.Expect<At<['a', 'b', 'c'], -1>, 'c'>,
    test.Expect<At<['a', 'b', 'c'], -2>, 'b'>,
    test.Expect<At<['a', 'b', 'c'], -3>, 'a'>,
    test.Expect<At<['a', 'b', 'c'], -4>, undefined>
  >;

  export type EachAt<TTable extends any[][], TIndex extends number> = TTable extends [
    infer INextRow extends any[],
    ...infer IRestRows extends any[][],
  ]
    ? [array.At<INextRow, TIndex>, ...EachAt<IRestRows, TIndex>]
    : [];

  declare const testEachAt: test.Describe<
    test.Expect<EachAt<[['a', 'b'], ['c']], -3>, [undefined, undefined]>,
    test.Expect<EachAt<[['a', 'b'], ['c']], -2>, ['a', undefined]>,
    test.Expect<EachAt<[['a', 'b'], ['c']], -1>, ['b', 'c']>,
    test.Expect<EachAt<[['a', 'b'], ['c']], 0>, ['a', 'c']>,
    test.Expect<EachAt<[['a', 'b'], ['c']], 1>, ['b', undefined]>,
    test.Expect<EachAt<[['a', 'b'], ['c']], 2>, [undefined, undefined]>
  >;

  export type Replace<TArr extends any[], TFrom, TTo> = {
    [I in keyof TArr]: TArr[I] extends TFrom ? TTo : TArr[I];
  };

  declare const testReplace: test.Describe<
    test.Expect<Replace<[], 'a', 'b'>, []>,
    test.Expect<Replace<['a'], 'a', 'b'>, ['b']>,
    test.Expect<Replace<['a'], 'a', 'b' | 'c'>, ['b' | 'c']>,
    test.Expect<Replace<['a'], 'a' | 'b', 'c'>, ['c']>,
    test.Expect<Replace<['b', 'a', 'b'], 'a', 'b'>, ['b', 'b', 'b']>,
    test.Expect<Replace<['b', 'a', 'b'], 'a', 'b' | 'c'>, ['b', 'b' | 'c', 'b']>,
    test.Expect<Replace<['b', 'a', 'b'], 'a' | 'b', 'c'>, ['c', 'c', 'c']>
  >;

  export type All<TArr extends any[], TItem> = {
    [I in keyof TArr]: TArr[I] extends TItem ? true : false;
  }[number] extends true
    ? true
    : false;

  declare const testAll: test.Describe<
    test.Expect<All<[], 'a'>, true>,
    test.Expect<All<['a'], 'a'>, true>,
    test.Expect<All<['a'], 'a' | 'b'>, true>,
    test.Expect<All<['a'], 'b'>, false>,
    test.Expect<All<['a', 'b'], 'a'>, false>,
    test.Expect<All<['a', 'b'], 'b'>, false>,
    test.Expect<All<['a', 'b'], 'a' | 'b'>, true>,
    test.Expect<All<['a', 'b'], 'a' | 'b' | 'c'>, true>
  >;

  export type Join<
    TArr extends any[][],
    TJoin extends any[] = [],
    TResult extends any[] = never,
  > = TArr extends [infer IA extends any[], infer IB extends any[], ...infer IRest extends any[][]]
    ? Join<[IB, ...IRest], TJoin, [TResult] extends [never] ? IA : [...TResult, ...TJoin, ...IA]>
    : TArr extends [infer IA extends any[]]
    ? [TResult] extends [never]
      ? IA
      : [...TResult, ...TJoin, ...IA]
    : [];

  declare const testJoin: test.Describe<
    test.Expect<Join<[]>, []>,
    test.Expect<Join<[], []>, []>,
    test.Expect<Join<[[]], []>, []>,
    test.Expect<Join<[[], []], []>, []>,
    test.Expect<Join<[[], []], [1]>, [1]>,
    test.Expect<Join<[[1]], []>, [1]>,
    test.Expect<Join<[[1], [3]], [2]>, [1, 2, 3]>,
    test.Expect<Join<[[1, 2], [3, 4], [5, 6]], []>, [1, 2, 3, 4, 5, 6]>,
    test.Expect<Join<[[1, 2], [3, 4], [5, 6]], [0]>, [1, 2, 0, 3, 4, 0, 5, 6]>,
    test.Expect<Join<[[], []], [1, 2, 3]>, [1, 2, 3]>
  >;

  export type Reverse<TArr extends any[]> = int.Dec<
    TArr['length']
  > extends infer ILengthDec extends number
    ? {
        [I in keyof TArr]: TArr[int.Subtract<ILengthDec, I>];
      }
    : never;

  declare const testReverse: test.Describe<
    test.Expect<Reverse<[]>, []>,
    test.Expect<Reverse<[1]>, [1]>,
    test.Expect<Reverse<[1, 2]>, [2, 1]>,
    test.Expect<Reverse<[1, 2, 3]>, [3, 2, 1]>,
    test.Expect<Reverse<['a', 'b', 'c']>, ['c', 'b', 'a']>
  >;
}
