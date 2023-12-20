import { strings } from './strings';
import { array } from './array';
import { int } from './int';
import { counter } from './counter';
import { test } from './test';
import { vec2 } from './vec2';

export namespace grid {
  type MaxGridSize = 150;

  type NumIncTable<TTable extends number[] = []> = TTable['length'] extends MaxGridSize
    ? TTable
    : NumIncTable<[...TTable, [...TTable, any]['length']]>;

  type NumDecTable<TTable extends number[] = [-1]> = TTable['length'] extends MaxGridSize
    ? TTable
    : NumDecTable<
        [...TTable, TTable extends [any, ...infer IRest extends number[]] ? IRest['length'] : never]
      >;

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
  export type IterEnd<TGrid extends Grid<any>> = vec2.Vec2<
    NumDecTable[Width<TGrid>],
    NumDecTable[Height<TGrid>]
  >;

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

  export type Vec2Set<TGrid extends Grid<any>, TIter extends Iter, TVal> = {
    [KY in keyof TGrid]: KY extends `${vec2.Y<TIter>}`
      ? TGrid[KY] extends infer IRow
        ? {
            [KX in keyof IRow]: KX extends `${vec2.X<TIter>}` ? TVal : IRow[KX];
          }
        : never
      : TGrid[KY];
  };

  export type Vec2Fill<
    TGrid extends Grid<any>,
    TA extends vec2.Vec2,
    TB extends vec2.Vec2,
    TVal,
  > = Vec2Set<TGrid, vec2.UnionRange<TA, TB>, TVal>;

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

  export type Vec2Step<
    TGrid extends Grid<any>,
    TVec extends vec2.Vec2,
    TStep extends '^' | 'v' | '<' | '>',
  > = vec2.X<TVec> extends infer IX extends number
    ? vec2.Y<TVec> extends infer IY extends number
      ? {
          '<': NumDecTable[IX] extends infer INextX extends number
            ? INextX extends -1
              ? never
              : vec2.Vec2<INextX, IY>
            : never;
          '>': IX extends -1
            ? vec2.Vec2<0, IY>
            : NumIncTable[IX] extends infer INextX extends number
            ? INextX extends Width<TGrid>
              ? never
              : vec2.Vec2<INextX, IY>
            : never;
          '^': NumDecTable[IY] extends infer INextY extends number
            ? INextY extends -1
              ? never
              : vec2.Vec2<IX, INextY>
            : never;
          v: IY extends -1
            ? vec2.Vec2<IX, 0>
            : NumIncTable[IY] extends infer INextY extends number
            ? INextY extends Height<TGrid>
              ? never
              : vec2.Vec2<IX, INextY>
            : never;
        }[TStep]
      : never
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

  export type Print<TGrid extends Grid<any>> = `[[\n${strings.Join<
    {
      [K in keyof TGrid]: `  ${strings.Join<TGrid[K]>}`;
    },
    '\n'
  >}\n]]`;

  export type RotateLeft<TGrid extends Grid<any>> = TGrid[0] extends infer IRow extends any[]
    ? int.Dec<grid.Width<TGrid>> extends infer IWidthDec extends number
      ? {
          [Y in keyof IRow]: {
            [X in keyof TGrid]: TGrid[X][int.Subtract<IWidthDec, Y>];
          };
        }
      : never
    : [];

  declare const testRotateLeft: test.Describe<
    test.Expect<RotateLeft<[]>, []>,
    test.Expect<RotateLeft<[[1, 2]]>, [[2], [1]]>,
    test.Expect<RotateLeft<[[1, 2], [3, 4]]>, [[2, 4], [1, 3]]>,
    test.Expect<RotateLeft<[[1, 2, 3], [4, 5, 6]]>, [[3, 6], [2, 5], [1, 4]]>
  >;

  export type RotateRight<TGrid extends Grid<any>> = TGrid[0] extends infer IRow extends any[]
    ? int.Dec<grid.Height<TGrid>> extends infer IHeightDec extends number
      ? {
          [Y in keyof IRow]: {
            [X in keyof TGrid]: TGrid[int.Subtract<
              IHeightDec,
              X
            >] extends infer IThisRow extends any[]
              ? IThisRow[Y & keyof IThisRow]
              : never;
          };
        }
      : never
    : [];

  declare const testRotateRight: test.Describe<
    test.Expect<RotateRight<[]>, []>,
    test.Expect<RotateRight<[[1, 2]]>, [[1], [2]]>,
    test.Expect<RotateRight<[[1, 2], [3, 4]]>, [[3, 1], [4, 2]]>,
    test.Expect<RotateRight<[[1, 2, 3], [4, 5, 6]]>, [[4, 1], [5, 2], [6, 3]]>
  >;
}
