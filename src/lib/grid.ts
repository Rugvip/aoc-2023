import { strings } from './strings';
import { array } from './array';
import { int } from './math';
import { counter } from './counter';
import { test } from './test';
import { vec2 } from './vec2';

export namespace grid {
  type MaxGridSize = 150;

  type MakeIncTable<TTable extends number[] = []> = TTable['length'] extends MaxGridSize
    ? TTable
    : MakeIncTable<[...TTable, [...TTable, any]['length']]>;

  type NumIncTable = MakeIncTable;

  export type Grid<T> = T[][];

  export type Parse<
    S extends string,
    TRows extends string[][] = [],
  > = S extends `${infer ILine}\n${infer IRest}`
    ? Parse<IRest, [...TRows, strings.ToChars<ILine>]>
    : S extends ''
    ? TRows
    : [...TRows, strings.ToChars<S>];

  export type Make<TItem, TWidth extends number, THeight extends number = TWidth> = array.Make<
    THeight,
    array.Make<TWidth, TItem>
  >;

  export type Iter = vec2.Vec2;

  export type IterZero = vec2.Zero;
  export type IterDone = vec2.Vec2<-1, -1>;

  export type IterNext<TGrid extends Grid<any>, TIter extends Iter> = TIter extends IterDone
    ? IterDone
    : NumIncTable[vec2.X<TIter>] extends infer INextX extends number
    ? INextX extends TGrid[0]['length']
      ? NumIncTable[vec2.Y<TIter>] extends infer INextY extends number
        ? INextY extends TGrid['length']
          ? IterDone
          : vec2.Vec2<0, INextY>
        : never
      : vec2.Vec2<INextX, vec2.Y<TIter>>
    : never;

  export type Vec2Set<TGrid extends Grid<any>, TIter extends Iter, TVal> = TIter extends IterDone
    ? TGrid
    : TIter extends vec2.Vec2<infer IX, infer IY>
    ? {
        [KY in keyof TGrid]: KY extends `${IY}`
          ? TGrid[KY] extends infer IRow
            ? {
                [KX in keyof IRow]: KX extends `${IX}` ? TVal : IRow[KX];
              }
            : never
          : TGrid[KY];
      }
    : never;

  export type Vec2Map<
    TGrid extends Grid<any>,
    TIter extends Iter,
    TMap extends { [_ in any]: any },
  > = TIter extends IterDone
    ? TGrid
    : TIter extends vec2.Vec2<infer IX, infer IY>
    ? {
        [KY in keyof TGrid]: KY extends `${IY}`
          ? TGrid[KY] extends infer IRow
            ? {
                [KX in keyof IRow]: KX extends `${IX}` ? TMap[IRow[KX] & keyof TMap] : IRow[KX];
              }
            : never
          : TGrid[KY];
      }
    : never;

  export type AtVec2<
    TGrid extends Grid<any>,
    TVec extends vec2.Vec2,
  > = TGrid[vec2.Y<TVec>][vec2.X<TVec>];

  export type At<TGrid extends Grid<any>, TX extends number, TY extends number> = TGrid[TY][TX];

  export type Width<TGrid extends Grid<any>> = TGrid[0]['length'];
  export type Height<TGrid extends Grid<any>> = TGrid['length'];

  export type RowAt<TGrid extends Grid<any>, TY extends number> = TGrid[TY];
  export type ReverseRowAt<TGrid extends Grid<any>, TY extends number> = array.Reverse<TGrid[TY]>;
  export type ColumnAt<TGrid extends Grid<any>, TX extends number> = {
    [K in keyof TGrid]: TGrid[K][TX];
  };
  export type ReverseColumnAt<TGrid extends Grid<any>, TX extends number> = int.Dec<
    TGrid['length']
  > extends infer IHeightDec extends number
    ? {
        [Y in keyof TGrid]: TGrid[int.Subtract<IHeightDec, Y>][TX];
      }
    : never;

  export type Count<
    TGrid extends Grid<any>,
    TItem,
    TIt extends Iter = IterZero,
    TCounter extends counter.Counter = counter.Zero,
  > = TIt extends IterDone
    ? counter.Value<TCounter>
    : Count<
        TGrid,
        TItem,
        IterNext<TGrid, TIt>,
        [AtVec2<TGrid, TIt>] extends [TItem] ? counter.Inc<TCounter> : TCounter
      >;

  export type Transpose<
    TGrid extends Grid<any>,
    TCounter extends counter.Counter = counter.Zero,
    TResult extends Grid<any> = [],
  > = counter.Value<TCounter> extends Width<TGrid>
    ? TResult
    : Transpose<
        TGrid,
        counter.Inc<TCounter>,
        [...TResult, ColumnAt<TGrid, counter.Value<TCounter>>]
      >;

  declare const testTranspose: test.Describe<
    test.Expect<Transpose<[]>, []>,
    test.Expect<Transpose<[[1, 2]]>, [[1], [2]]>,
    test.Expect<Transpose<[[1, 2], [3, 4]]>, [[1, 3], [2, 4]]>,
    test.Expect<Transpose<[[1, 2, 3], [4, 5, 6]]>, [[1, 4], [2, 5], [3, 6]]>
  >;
}
