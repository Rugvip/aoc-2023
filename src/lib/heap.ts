import * as test from './test';
import * as bigint from './bigint';
import * as counter from './counter';

export type Empty = null;

export type Node =
  | [max: string, count: counter.Counter, items: string, left: Node, right: Node]
  | null;
type NodeItem<
  TValue extends string = string,
  TData extends string = string,
> = `${TValue}:${TData};`;

type FitsInNode<TNode extends Node, TValue extends string> = TNode extends [
  infer IMax extends string,
  any,
  any,
  any,
  any,
]
  ? bigint.Compare<TValue, IMax> extends 'gt'
    ? false
    : true
  : false;

type MaxSize = counter.Make<199>;
type MaxSizeHalf = counter.Make<100>;

export type Insert<
  TNode extends Node,
  TValue extends string,
  TData extends string,
> = TNode extends [
  infer IMax extends string,
  infer ICount extends counter.Counter,
  infer IItems extends string,
  infer ILeft extends Node,
  infer IRight extends Node,
]
  ? FitsInNode<ILeft, TValue> extends true
    ? [IMax, ICount, IItems, Insert<ILeft, TValue, TData>, IRight]
    : bigint.Compare<TValue, IMax> extends 'gt'
    ? [IMax, ICount, IItems, ILeft, Insert<IRight, TValue, TData>]
    : ICount extends MaxSize
    ? InsertItemAndPivot<IItems, TValue, TData, MaxSizeHalf> extends [
        infer IPivot extends string,
        infer ILeftItems extends string,
        infer IRightItems extends string,
      ]
      ? [IPivot, MaxSizeHalf, ILeftItems, ILeft, [IMax, MaxSizeHalf, IRightItems, null, IRight]]
      : never
    : [IMax, counter.Inc<ICount>, InsertItem<IItems, TValue, TData>, ILeft, IRight]
  : [max: TValue, counter.Make<1>, NodeItem<TValue, TData>, null, null];

declare const testInsert: test.Describe<
  test.Expect<Insert<null, '2', 'a'>, ['2', counter.Make<1>, '2:a;', null, null]>,
  test.Expect<
    Insert<Insert<null, '3', 'b'>, '2', 'a'>,
    ['3', counter.Make<2>, '2:a;3:b;', null, null]
  >,
  test.Expect<
    Insert<Insert<null, '2', 'a'>, '3', 'b'>,
    ['2', counter.Make<1>, '2:a;', null, ['3', counter.Make<1>, '3:b;', null, null]]
  >,
  test.Expect<
    Insert<Insert<Insert<null, '1', 'a'>, '2', 'b'>, '3', 'c'>,
    [
      '1',
      counter.Make<1>,
      '1:a;',
      null,
      ['2', counter.Make<1>, '2:b;', null, ['3', counter.Make<1>, '3:c;', null, null]],
    ]
  >,
  test.Expect<
    Insert<Insert<Insert<null, '3', 'c'>, '2', 'b'>, '1', 'a'>,
    ['3', counter.Make<3>, '1:a;2:b;3:c;', null, null]
  >,
  test.Expect<
    Insert<Insert<Insert<null, '2', 'b'>, '3', 'c'>, '1', 'a'>,
    ['2', counter.Make<2>, '1:a;2:b;', null, ['3', counter.Make<1>, '3:c;', null, null]]
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
      right: TInserted extends true ? TItems : InsertItem<TItems, TValue, TData>,
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
    [pivot: '1', left: '1:a;', right: '2:b;']
  >,
  test.Expect<
    InsertItemAndPivot<'2:b;', '1', 'a', counter.Make<1>>,
    [pivot: '1', left: '1:a;', right: '2:b;']
  >,
  test.Expect<
    InsertItemAndPivot<'1:a;2:b;3:c;', '4', 'd', counter.Make<2>>,
    [pivot: '2', left: '1:a;2:b;', right: '3:c;4:d;']
  >,
  test.Expect<
    InsertItemAndPivot<'1:a;2:b;4:d;', '3', 'c', counter.Make<2>>,
    [pivot: '2', left: '1:a;2:b;', right: '3:c;4:d;']
  >,
  test.Expect<
    InsertItemAndPivot<'1:a;3:c;4:d;', '2', 'b', counter.Make<2>>,
    [pivot: '2', left: '1:a;2:b;', right: '3:c;4:d;']
  >,
  test.Expect<
    InsertItemAndPivot<'2:b;3:c;4:d;', '1', 'a', counter.Make<2>>,
    [pivot: '2', left: '1:a;2:b;', right: '3:c;4:d;']
  >
>;

export type PopMin<TNode extends Node> = TNode extends [
  infer IMax extends string,
  infer ICount extends counter.Counter,
  infer IItems extends string,
  infer ILeft extends Node,
  infer IRight extends Node,
]
  ? PopMin<ILeft> extends [value: infer IMinValue, data: infer IMinData, new: infer INewTree]
    ? [value: IMinValue, data: IMinData, new: [IMax, ICount, IItems, INewTree, IRight]]
    : ICount extends counter.Zero
    ? PopMin<IRight>
    : IItems extends `${NodeItem<infer IValue, infer IData>}${infer IRest}`
    ? [value: IValue, data: IData, new: [IMax, counter.Dec<ICount>, IRest, null, IRight]]
    : never
  : null;

declare const testPopMin: test.Describe<
  test.Expect<
    PopMin<['2', counter.Make<1>, '2:a;', null, null]>,
    ['2', 'a', ['2', counter.Zero, '', null, null]]
  >,
  test.Expect<PopMin<['2', counter.Zero, '', null, null]>, null>,
  test.Expect<
    PopMin<['2', counter.Make<1>, '2:b;', ['1', counter.Make<1>, '1:a;', null, null], null]>,
    ['1', 'a', ['2', counter.Make<1>, '2:b;', ['1', counter.Zero, '', null, null], null]]
  >,
  test.Expect<
    PopMin<['2', counter.Make<1>, '2:b;', ['1', counter.Zero, '', null, null], null]>,
    ['2', 'b', ['2', counter.Zero, '', null, null]]
  >
>;
