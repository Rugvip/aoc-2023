import * as test from './test';
import * as bigint from './bigint';
import * as counter from './counter';

export type Empty = null;

export type Node = [max: string, count: counter.Counter, items: string, next: Node] | null;
type NodeItem<
  TValue extends string = string,
  TData extends string = string,
> = `${TValue}:${TData};`;

type MaxSize = counter.Make<399>;
type MaxSizeHalf = counter.Make<200>;

export type Insert<
  TNode extends Node,
  TValue extends string,
  TData extends string,
> = TNode extends [
  infer IMax extends string,
  infer ICount extends counter.Counter,
  infer IItems extends string,
  infer IRight extends Node,
]
  ? bigint.Compare<TValue, IMax> extends 'gt'
    ? [IMax, ICount, IItems, Insert<IRight, TValue, TData>]
    : ICount extends MaxSize
    ? InsertItemAndPivot<IItems, TValue, TData, MaxSizeHalf> extends [
        infer IPivot extends string,
        infer ILeftItems extends string,
        infer IRightItems extends string,
      ]
      ? [IPivot, MaxSizeHalf, ILeftItems, [IMax, MaxSizeHalf, IRightItems, IRight]]
      : never
    : [IMax, counter.Inc<ICount>, InsertItem<IItems, TValue, TData>, IRight]
  : [max: TValue, counter.Make<1>, NodeItem<TValue, TData>, null];

declare const testInsert: test.Describe<
  test.Expect<Insert<null, '2', 'a'>, ['2', counter.Make<1>, '2:a;', null]>,
  test.Expect<
    Insert<Insert<Insert<null, '1', 'a'>, '2', 'b'>, '3', 'c'>,
    [
      '1',
      counter.Make<1>,
      '1:a;',
      ['2', counter.Make<1>, '2:b;', ['3', counter.Make<1>, '3:c;', null]],
    ]
  >,
  test.Expect<
    Insert<Insert<Insert<null, '3', 'c'>, '2', 'b'>, '1', 'a'>,
    ['3', counter.Make<3>, '1:a;2:b;3:c;', null]
  >,
  test.Expect<
    Insert<Insert<Insert<null, '2', 'b'>, '3', 'c'>, '1', 'a'>,
    ['2', counter.Make<2>, '1:a;2:b;', ['3', counter.Make<1>, '3:c;', null]]
  >
>;

type InsertItem<
  TItems extends string,
  TValue extends string,
  TData extends string,
  TResult extends string = '',
> = TItems extends `${NodeItem<infer IValue, infer IData>}${infer IRest}`
  ? bigint.Compare<TValue, IValue> extends 'lt'
    ? `${TResult}${NodeItem<TValue, TData>}${TItems}`
    : InsertItem<IRest, TValue, TData, `${TResult}${NodeItem<IValue, IData>}`>
  : `${TResult}${NodeItem<TValue, TData>}`;

declare const testInsertItem: test.Describe<
  test.Expect<InsertItem<'', '1', 'a'>, '1:a;'>,
  test.Expect<InsertItem<'1:a;', '2', 'b'>, '1:a;2:b;'>,
  test.Expect<InsertItem<'1:a;2:b;', '3', 'c'>, '1:a;2:b;3:c;'>,
  test.Expect<InsertItem<'1:a;3:c;', '2', 'b'>, '1:a;2:b;3:c;'>,
  test.Expect<InsertItem<'2:b;3:c;', '1', 'a'>, '1:a;2:b;3:c;'>
>;

type InsertItemAndPivot<
  TItems extends string,
  TValue extends string,
  TData extends string,
  TPivotPoint extends counter.Counter,
  TInserted extends boolean = false,
  TLastValue extends string = never,
  TResult extends string = '',
> = TPivotPoint extends counter.Zero
  ? [
      pivot: TLastValue,
      left: TResult,
      next: TInserted extends true ? TItems : InsertItem<TItems, TValue, TData>,
    ]
  : TItems extends `${NodeItem<infer IValue, infer IData>}${infer IRest}`
  ? TInserted extends true
    ? InsertItemAndPivot<
        IRest,
        TValue,
        TData,
        counter.Dec<TPivotPoint>,
        true,
        IValue,
        `${TResult}${NodeItem<IValue, IData>}`
      >
    : bigint.Compare<TValue, IValue> extends 'lt'
    ? InsertItemAndPivot<
        TItems,
        TValue,
        TData,
        counter.Dec<TPivotPoint>,
        true,
        TValue,
        `${TResult}${NodeItem<TValue, TData>}`
      >
    : InsertItemAndPivot<
        IRest,
        TValue,
        TData,
        counter.Dec<TPivotPoint>,
        false,
        IValue,
        `${TResult}${NodeItem<IValue, IData>}`
      >
  : never;

declare const testInsertItemAndPivot: test.Describe<
  test.Expect<
    InsertItemAndPivot<'1:a;', '2', 'b', counter.Make<1>>,
    [pivot: '1', left: '1:a;', next: '2:b;']
  >,
  test.Expect<
    InsertItemAndPivot<'2:b;', '1', 'a', counter.Make<1>>,
    [pivot: '1', left: '1:a;', next: '2:b;']
  >,
  test.Expect<
    InsertItemAndPivot<'1:a;2:b;3:c;', '4', 'd', counter.Make<2>>,
    [pivot: '2', left: '1:a;2:b;', next: '3:c;4:d;']
  >,
  test.Expect<
    InsertItemAndPivot<'1:a;2:b;4:d;', '3', 'c', counter.Make<2>>,
    [pivot: '2', left: '1:a;2:b;', next: '3:c;4:d;']
  >,
  test.Expect<
    InsertItemAndPivot<'1:a;3:c;4:d;', '2', 'b', counter.Make<2>>,
    [pivot: '2', left: '1:a;2:b;', next: '3:c;4:d;']
  >,
  test.Expect<
    InsertItemAndPivot<'2:b;3:c;4:d;', '1', 'a', counter.Make<2>>,
    [pivot: '2', left: '1:a;2:b;', next: '3:c;4:d;']
  >
>;

export type PopMin<TNode extends Node> = TNode extends [
  infer IMax extends string,
  infer ICount extends counter.Counter,
  infer IItems extends string,
  infer IRight extends Node,
]
  ? ICount extends counter.Zero
    ? PopMin<IRight>
    : IItems extends `${NodeItem<infer IValue, infer IData>}${infer IRest}`
    ? [value: IValue, data: IData, new: [IMax, counter.Dec<ICount>, IRest, IRight]]
    : never
  : null;

declare const testPopMin: test.Describe<
  test.Expect<
    PopMin<['2', counter.Make<1>, '2:a;', null]>,
    ['2', 'a', ['2', counter.Zero, '', null]]
  >,
  test.Expect<PopMin<['2', counter.Zero, '', null]>, null>,
  test.Expect<
    PopMin<['1', counter.Make<1>, '1:a;', ['2', counter.Make<1>, '2:b;', null]]>,
    ['1', 'a', ['1', counter.Zero, '', ['2', counter.Make<1>, '2:b;', null]]]
  >,
  test.Expect<
    PopMin<['1', counter.Zero, '', ['2', counter.Make<1>, '2:b;', null]]>,
    ['2', 'b', ['2', counter.Zero, '', null]]
  >
>;
