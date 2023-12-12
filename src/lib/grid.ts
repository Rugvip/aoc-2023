import { strings } from './strings';
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
    : TRows;

  export type Iterator = vec2.Vec2;

  export type IteratorZero = vec2.Vec2<0, 0>;
  export type IteratorDone = vec2.Vec2<-1, -1>;

  export type IterNext<
    TGrid extends Grid<any>,
    TIterator extends Iterator,
  > = TIterator extends IteratorDone
    ? IteratorDone
    : NumIncTable[vec2.X<TIterator>] extends infer INextX extends number
    ? INextX extends TGrid[0]['length']
      ? NumIncTable[vec2.Y<TIterator>] extends infer INextY extends number
        ? INextY extends TGrid['length']
          ? IteratorDone
          : vec2.Vec2<0, INextY>
        : never
      : vec2.Vec2<INextX, vec2.Y<TIterator>>
    : never;

  export type AtVec2<
    TGrid extends Grid<any>,
    TVec extends vec2.Vec2,
  > = TGrid[vec2.Y<TVec>][vec2.X<TVec>];

  export type At<TGrid extends Grid<any>, TX extends number, TY extends number> = TGrid[TY][TX];
}
