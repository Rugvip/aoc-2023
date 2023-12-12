import { counter } from './counter';
import { strings } from './strings';
import { array } from './array';

export namespace grid {
  type MaxGridSize = 150;

  type MakeIncTable<TTable extends number[] = []> = TTable['length'] extends MaxGridSize
    ? TTable
    : MakeIncTable<[...TTable, [...TTable, any]['length']]>;

  type NumIncTable = MakeIncTable;
  type GridIndices = array.Indices<NumIncTable>;

  export type Grid<T> = T[][];

  export type Parse<
    S extends string,
    TRows extends string[][] = [],
  > = S extends `${infer ILine}\n${infer IRest}`
    ? Parse<IRest, [...TRows, strings.ToChars<ILine>]>
    : TRows;

  export type Coords<TX extends number = number, TY extends number = number> = TX | `${TY}`;
  export type Iterator = Coords;

  export type IteratorZero = '0' | 0;

  export type IterNext<TGrid extends Grid<any>, TIterator extends Iterator> = [TIterator] extends [
    -1,
  ]
    ? -1
    : NumIncTable[TIterator & number] extends infer INextX extends GridIndices
    ? INextX extends TGrid[0]['length']
      ? NumIncTable[strings.ToNumber<TIterator & string>] extends infer INextY extends GridIndices
        ? INextY extends TGrid['length']
          ? -1
          : `${INextY}` | 0
        : never
      : (TIterator & string) | INextX
    : never;

  export type AtCoords<TGrid extends Grid<any>, TCoords extends Iterator> = TGrid[strings.ToNumber<
    TCoords & string
  >][TCoords & number];

  export type CoordX<TCoords extends Iterator> = TCoords & number;

  export type CoordY<TCoords extends Iterator> = strings.ToNumber<TCoords & string>;

  export type At<TGrid extends Grid<any>, TX extends number, TY extends number> = TGrid[TY][TX];

  type grid = Parse<`abcd
efgh
ijkl
mnop
`>;

  type it = IteratorZero;
  type next0 = IterNext<grid, it>;
  type next1 = IterNext<grid, next0>;
  type next2 = IterNext<grid, next1>;
  type next3 = IterNext<grid, next2>;
  type next4 = IterNext<grid, next3>;
  type next5 = IterNext<grid, next4>;
  type next6 = IterNext<grid, next5>;
  type next7 = IterNext<grid, next6>;
  type next8 = IterNext<grid, next7>;
  type next9 = IterNext<grid, next8>;
  type next10 = IterNext<grid, next9>;
  type next11 = IterNext<grid, next10>;
  type next12 = IterNext<grid, next11>;
  type next13 = IterNext<grid, next12>;
  type next14 = IterNext<grid, next13>;
  type next15 = IterNext<grid, next14>;
}
