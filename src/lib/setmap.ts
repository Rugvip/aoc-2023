import * as test from './test';

export type Map = [string, string];
export type Empty = never;

export type BulkAdd<TMap extends Map, UEntries extends string> = [UEntries] extends [never]
  ? TMap
  : [UEntries] extends [`${infer IKey}=${string}`]
  ?
      | (IKey extends TMap[0]
          ? TMap extends [IKey, infer IItems extends string]
            ? [IKey, IItems | ([UEntries] extends [`${IKey}=${infer IValue}`] ? IValue : never)]
            : never
          : [IKey, [UEntries] extends [`${IKey}=${infer IValue}`] ? IValue : never])
      | (TMap extends [IKey, any] ? never : TMap)
  : never;

declare const testBulkAdd: test.Describe<
  test.Expect<BulkAdd<Empty, never>, never>,
  test.Expect<BulkAdd<Empty, '1=a'>, ['1', 'a']>,
  test.Expect<BulkAdd<Empty, '1=a' | '2=b'>, ['1', 'a'] | ['2', 'b']>,
  test.Expect<BulkAdd<Empty, '1=a' | '2=b' | '2=c'>, ['1', 'a'] | ['2', 'b' | 'c']>,
  test.Expect<BulkAdd<['1', 'a'], '1=b'>, ['1', 'a' | 'b']>,
  test.Expect<BulkAdd<['1', 'a'], never>, ['1', 'a']>,
  test.Expect<BulkAdd<['1', 'a'], '2=b'>, ['1', 'a'] | ['2', 'b']>,
  test.Expect<
    BulkAdd<['1', 'a' | 'b'] | ['3', 'c'], '1=x' | '2=y'>,
    ['1', 'a' | 'b' | 'x'] | ['2', 'y'] | ['3', 'c']
  >
>;

export type RemoveValues<TMap extends Map, UValues extends string> = TMap extends any
  ? TMap extends [infer IKey, infer IItems extends string]
    ? [IKey, IItems extends UValues ? never : IItems]
    : never
  : never;

declare const testBulkRemoveValues: test.Describe<
  test.Expect<RemoveValues<Empty, never>, never>,
  test.Expect<RemoveValues<['1', 'a'], 'a'>, ['1', never]>,
  test.Expect<RemoveValues<['1', 'a' | 'b'], 'a'>, ['1', 'b']>,
  test.Expect<
    RemoveValues<['1', 'a' | 'b'] | ['2', 'a'] | ['3', 'c'], 'a'>,
    ['1', 'b'] | ['2', never] | ['3', 'c']
  >
>;

export type Add<TMap extends Map, TKey extends string, TValue extends string> = [
  TKey,
  any,
] extends TMap
  ? TMap extends [TKey, infer IItems extends string]
    ? [TKey, IItems | TValue]
    : TMap
  : TMap | [TKey, TValue];

declare const testAdd: test.Describe<
  test.Expect<Add<Empty, '1', 'a'>, ['1', 'a']>,
  test.Expect<Add<['1', 'a'], '1', 'b'>, ['1', 'a' | 'b']>,
  test.Expect<Add<['1', 'a' | 'b'], '1', 'c'>, ['1', 'a' | 'b' | 'c']>,
  test.Expect<
    Add<['1', 'a' | 'b'] | ['2', 'c'], '3', 'd'>,
    ['1', 'a' | 'b'] | ['2', 'c'] | ['3', 'd']
  >,
  test.Expect<Add<['1', 'a' | 'b'] | ['2', 'c'], '2', 'd'>, ['1', 'a' | 'b'] | ['2', 'c' | 'd']>
>;

export type Get<TMap extends Map, TKey extends string> = [TKey, any] extends TMap
  ? TMap extends [TKey, infer IItems extends string]
    ? IItems
    : never
  : never;

declare const testGet: test.Describe<
  test.Expect<Get<Empty, '1'>, never>,
  test.Expect<Get<['1', 'a'], '1'>, 'a'>,
  test.Expect<Get<['1', 'a' | 'b'], '1'>, 'a' | 'b'>,
  test.Expect<Get<['1', 'a' | 'b'], '2'>, never>,
  test.Expect<Get<['1', 'a' | 'b'] | ['2', 'c'], '1'>, 'a' | 'b'>,
  test.Expect<Get<['1', 'a' | 'b'] | ['2', 'c'], '2'>, 'c'>
>;

export type Remove<TMap extends Map, TKey extends string> = TMap extends [TKey, any] ? never : TMap;

declare const testRemove: test.Describe<
  test.Expect<Remove<Empty, '1'>, never>,
  test.Expect<Remove<['1', 'a'], '1'>, never>,
  test.Expect<Remove<['1', 'a' | 'b'], '1'>, never>,
  test.Expect<Remove<['1', 'a' | 'b'], '2'>, ['1', 'a' | 'b']>,
  test.Expect<Remove<['1', 'a' | 'b'] | ['2', 'c'], '1'>, ['2', 'c']>,
  test.Expect<Remove<['1', 'a' | 'b'] | ['2', 'c'], '2'>, ['1', 'a' | 'b']>
>;

export type Merge<A extends Map, B extends Map> = [A] extends [never]
  ? B
  : A extends [infer AKey, infer AItems]
  ? [AKey, any] extends B
    ? B extends [AKey, infer BItems]
      ? [AKey, AItems | BItems]
      : B
    : A
  : never;

declare const testMerge: test.Describe<
  test.Expect<Merge<Empty, Empty>, Empty>,
  test.Expect<Merge<['1', 'a'], Empty>, ['1', 'a']>,
  test.Expect<Merge<Empty, ['1', 'a']>, ['1', 'a']>,
  test.Expect<Merge<['1', 'a'], ['1', 'b']>, ['1', 'a' | 'b']>,
  test.Expect<Merge<['1', 'a' | 'b'], ['1', 'b' | 'c']>, ['1', 'a' | 'b' | 'c']>,
  test.Expect<
    Merge<['1', 'a'] | ['2', 'a' | 'b'], ['2', 'b' | 'c'] | ['3', 'c']>,
    ['1', 'a'] | ['2', 'a' | 'b' | 'c'] | ['3', 'c']
  >
>;

export type UnionMerge<U extends Map> = [U] extends [never]
  ? never
  : Keys<U> extends infer UKey
  ? UKey extends any
    ? [UKey, U extends [UKey, infer IItems] ? IItems : never]
    : never
  : never;

type Keys<U extends Map> = [U] extends [[infer UKey, any]] ? UKey : never;

declare const testUnionMerge: test.Describe<
  test.Expect<UnionMerge<Empty | Empty>, Empty>,
  test.Expect<UnionMerge<['1', 'a'] | Empty>, ['1', 'a']>,
  test.Expect<UnionMerge<Empty | ['1', 'a']>, ['1', 'a']>,
  test.Expect<UnionMerge<['1', 'a'] | ['1', 'b']>, ['1', 'a' | 'b']>,
  test.Expect<UnionMerge<['1', 'a'] | ['2', 'b']>, ['1', 'a'] | ['2', 'b']>,
  test.Expect<UnionMerge<['1', 'a' | 'b'] | ['1', 'b' | 'c']>, ['1', 'a' | 'b' | 'c']>,
  test.Expect<
    UnionMerge<['1', 'a'] | ['2', 'a' | 'b'] | ['2', 'b' | 'c'] | ['3', 'c']>,
    ['1', 'a'] | ['2', 'a' | 'b' | 'c'] | ['3', 'c']
  >
>;
