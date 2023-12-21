import { Input } from '../input/21';
import { array, int, grid } from './lib';

// type Input1 = `...........
// .....###.#.
// .###.##..#.
// ..#.#...#..
// ....#.#....
// .##..S####.
// .##..#...#.
// .......##..
// .##.#.####.
// .##..##.##.
// ...........
// `;

type PathGrid = Parsed extends infer IGrid extends grid.Grid<string>
  ? {
      [Y in keyof IGrid]: IGrid[Y] extends infer IRow
        ? {
            [X in keyof IRow]: IRow[X] extends '#' ? false : true;
          }
        : never;
    }
  : never;

type WalkGrid = Parsed extends infer IGrid extends grid.Grid<string>
  ? {
      [Y in keyof IGrid]: IGrid[Y] extends infer IRow
        ? {
            [X in keyof IRow]: IRow[X] extends 'S' ? true : false;
          }
        : never;
    }
  : never;
type EmptyRow = array.Make<Parsed[0]['length'], false>;

type ShiftGridLeft<TGrid extends grid.Grid<boolean>> = {
  [Y in keyof TGrid]: TGrid[Y] extends [any, ...infer IRow extends boolean[]]
    ? [...IRow, false]
    : never;
};
type ShiftGridRight<TGrid extends grid.Grid<boolean>> = {
  [Y in keyof TGrid]: TGrid[Y] extends [...infer IRow extends boolean[], any]
    ? [false, ...IRow]
    : never;
};
type ShiftGridUp<TGrid extends grid.Grid<boolean>> = TGrid extends [
  any,
  ...infer IRows extends boolean[][],
]
  ? [...IRows, EmptyRow]
  : never;
type ShiftGridDown<TGrid extends grid.Grid<boolean>> = TGrid extends [
  ...infer IRows extends boolean[][],
  any,
]
  ? [EmptyRow, ...IRows]
  : never;

type ExpandWalk<TGrid extends grid.Grid<boolean>> = grid.Or4<
  ShiftGridLeft<TGrid>,
  ShiftGridRight<TGrid>,
  ShiftGridUp<TGrid>,
  ShiftGridDown<TGrid>
>;

type NextWalkGrid<TGrid extends grid.Grid<boolean>> = grid.And<ExpandWalk<TGrid>, PathGrid>;

type NWalkGrid<TCount extends number, TGrid extends grid.Grid<boolean>> = TCount extends 0
  ? TGrid
  : NWalkGrid<int.Dec<TCount>, NextWalkGrid<TGrid>>;

type Parsed = grid.Parse<Input>;

export declare const solution1: grid.Count<NWalkGrid<64, WalkGrid>, true>;
