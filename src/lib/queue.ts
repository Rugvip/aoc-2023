import * as test from './test';

type IncTable<TTable extends number[] = []> = TTable['length'] extends 100
  ? TTable
  : IncTable<[...TTable, [...TTable, any]['length']]>;
type DecTable<TTable extends number[] = []> = TTable['length'] extends 100
  ? [0, ...TTable]
  : DecTable<[...TTable, TTable['length']]>;

export type Queue = string | number | string[];

export type Empty = '' | 0 | [];

export type Pop<T extends Queue> = '' extends T
  ? (T extends string[] ? T : never) extends [
      `${infer ICount extends number}|${infer IHead extends string}`,
      ...infer IRest extends string[],
    ]
    ? Pop<ICount | IHead | IRest>
    : undefined
  : [
      head: T extends `${infer IHead};${string}` ? IHead : never,
      rest:
        | (T extends `${string};${infer IRest}` ? IRest : never)
        | DecTable[T extends number ? T : never]
        | (T extends string[] ? T : never),
    ];

declare const testPop: test.Describe<
  test.Expect<Pop<Empty>, undefined>,
  test.Expect<Pop<Push<Empty, 'test'>>, [item: 'test', rest: Empty]>,
  test.Expect<Pop<Pop<Push<Push<Empty, 'a'>, 'b'>[1]>>, [item: 'a', rest: Empty]>,
  test.Expect<Pop<3 | 'a;b;c;' | []>, [item: 'a', rest: 2 | 'b;c;' | []]>,
  test.Expect<Pop<0 | '' | ['2|a;b;']>, [item: 'a', rest: 1 | 'b;' | []]>
>;

export type Push<T extends Queue, TItem extends string> = IncTable[T extends number
  ? T
  : never] extends infer INextCount extends number
  ? INextCount | `${TItem};${T extends string ? T : never}` | (T extends string[] ? T : never)
  :
      | `${TItem};`
      | 1
      | [
          `${T extends number ? T : never}|${T extends string ? T : never}`,
          ...(T extends string[] ? T : never),
        ];

declare const testPush: test.Describe<
  test.Expect<Push<Empty, 'test'>, 1 | 'test;' | []>,
  test.Expect<Push<1 | 'a;' | [], 'test'>, 2 | 'test;a;' | []>,
  test.Expect<Push<99 | 'a;' | [], 'test'>, 100 | 'test;a;' | []>,
  test.Expect<Push<100 | 'a;' | [], 'test'>, 1 | 'test;' | ['100|a;']>
>;
