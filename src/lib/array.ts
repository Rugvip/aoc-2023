import type * as int from './int';
import { counter } from './counter';
import { test } from './test';

export namespace array {
  type A0 = [any];
  type A1 = [...A0, ...A0, ...A0, ...A0, ...A0, ...A0, ...A0, ...A0, ...A0, ...A0];
  type A2 = [...A1, ...A1, ...A1, ...A1, ...A1, ...A1, ...A1, ...A1, ...A1, ...A1];
  type A3 = [...A2, ...A2, ...A2, ...A2, ...A2, ...A2, ...A2, ...A2, ...A2, ...A2];

  type NCopyArr<TArr extends any[], N extends number, TResult extends any[] = []> = N extends 0
    ? TResult
    : NCopyArr<TArr, int.Dec<N>, [...TResult, ...TArr]>;

  type StrToDigitsReverse<S extends string> =
    S extends `${infer IChar extends int.Digit}${infer IRest}`
      ? [...StrToDigitsReverse<IRest>, IChar]
      : [];

  export type MakeAny<N extends number | string = 0> = `${N}` extends infer NS extends string // Weird OOM bug if using N directly here
    ? StrToDigitsReverse<NS> extends infer IDigits extends int.Digit[]
      ? [
          ...(IDigits[0] extends undefined ? [] : NCopyArr<A0, IDigits[0]>),
          ...(IDigits[1] extends undefined ? [] : NCopyArr<A1, IDigits[1]>),
          ...(IDigits[2] extends undefined ? [] : NCopyArr<A2, IDigits[2]>),
          ...(IDigits[3] extends undefined ? [] : NCopyArr<A3, IDigits[3]>),
        ]
      : never
    : never;

  declare const testMakeAny: test.Describe<
    test.Expect<MakeAny<0>, []>,
    test.Expect<MakeAny<1>, [any]>,
    test.Expect<MakeAny<2>, [any, any]>,
    test.Expect<MakeAny<10>, A1>,
    test.Expect<MakeAny<100>, A2>,
    test.Expect<MakeAny<1000>, A3>,
    test.Expect<MakeAny<2222>, [...A3, ...A3, ...A2, ...A2, ...A1, ...A1, ...A0, ...A0]>
  >;

  export type Make<
    TLength extends number = 0,
    TItem = any,
  > = MakeAny<TLength> extends infer IArr extends any[] ? { [K in keyof IArr]: TItem } : never;

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

  export type Remove<TArr extends any[], URemoved, TResult extends any[] = []> = TArr extends [
    infer IHead,
    ...infer ITail,
  ]
    ? Remove<ITail, URemoved, IHead extends URemoved ? TResult : [...TResult, IHead]>
    : TResult;

  declare const testRemove: test.Describe<
    test.Expect<Remove<[], 'a'>, []>,
    test.Expect<Remove<['a', 'b', 'c'], 'a'>, ['b', 'c']>,
    test.Expect<Remove<['a', 'b', 'c'], 'a' | 'b'>, ['c']>
  >;

  export type RemoveFirst<TArr extends any[], URemoved, TResult extends any[] = []> = TArr extends [
    infer IHead,
    ...infer ITail,
  ]
    ? IHead extends URemoved
      ? [...TResult, ...ITail]
      : RemoveFirst<ITail, URemoved, [...TResult, IHead]>
    : TResult;

  declare const testRemoveFirst: test.Describe<
    test.Expect<RemoveFirst<[], 'a'>, []>,
    test.Expect<RemoveFirst<['a', 'b', 'c'], 'a'>, ['b', 'c']>,
    test.Expect<RemoveFirst<['a', 'b', 'c'], 'a' | 'b'>, ['b', 'c']>
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

  type SplitAt<
    TArr extends any[],
    TIndex extends number,
    TCounter extends counter.Counter = counter.Make<TIndex>,
    TLeading extends any[] = [],
  > = TCounter extends counter.Zero
    ? [leading: TLeading, trailing: TArr]
    : TArr extends [infer IHead, ...infer ITail extends any[]]
    ? SplitAt<ITail, TIndex, counter.Dec<TCounter>, [...TLeading, IHead]>
    : never;

  declare const testSplitAt: test.Describe<
    test.Expect<SplitAt<[], 0>, [[], []]>,
    test.Expect<SplitAt<[1], 0>, [[], [1]]>,
    test.Expect<SplitAt<[1], 1>, [[1], []]>,
    test.Expect<SplitAt<[1, 2], 0>, [[], [1, 2]]>,
    test.Expect<SplitAt<[1, 2], 1>, [[1], [2]]>,
    test.Expect<SplitAt<[1, 2], 2>, [[1, 2], []]>
  >;

  export type Sum<
    TArr extends (string | number)[],
    TIt extends counter.Counter = counter.Dec<counter.Make<TArr['length']>>,
    TSum extends number = 0,
  > = TIt extends counter.Done
    ? TSum
    : Sum<TArr, counter.Dec<TIt>, int.Add<TSum, TArr[counter.Value<TIt>]>>;

  declare const testSum: test.Describe<
    test.Expect<Sum<[]>, 0>,
    test.Expect<Sum<[1]>, 1>,
    test.Expect<Sum<[1, 2]>, 3>,
    test.Expect<Sum<[1, '2', 3]>, 6>,
    test.Expect<Sum<['1', '-1', '2']>, 2>
  >;

  export type Product<
    TArr extends (string | number)[],
    TIt extends counter.Counter = counter.Dec<counter.Make<TArr['length']>>,
    TProduct extends number = 1,
  > = TIt extends counter.Done
    ? TProduct
    : Product<TArr, counter.Dec<TIt>, int.Multiply<TProduct, TArr[counter.Value<TIt>]>>;

  declare const testProduct: test.Describe<
    test.Expect<Product<[]>, 1>,
    test.Expect<Product<[1]>, 1>,
    test.Expect<Product<[1, 2]>, 2>,
    test.Expect<Product<['2', 3]>, 6>,
    test.Expect<Product<['1', '-1', '2']>, -2>
  >;
}
