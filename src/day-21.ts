import { Input } from '../input/21';
import { array, bigint, counter, grid } from './lib';

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

type Parsed = grid.Parse<Input>;

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

type NextWalkGrid<TGrid extends grid.Grid<boolean>, TMask extends grid.Grid<boolean>> = grid.And<
  ExpandWalk<TGrid>,
  TMask
>;

type RepeatWalkGrid<
  TCount extends number,
  TGrid extends grid.Grid<boolean>,
  TMask extends grid.Grid<boolean>,
  TCounter extends counter.Counter = counter.Make<TCount>,
> = TCounter extends counter.Zero
  ? TGrid
  : RepeatWalkGrid<TCount, NextWalkGrid<TGrid, TMask>, TMask, counter.Dec<TCounter>>;

type Solve1<TSteps extends number> = grid.Count<RepeatWalkGrid<TSteps, WalkGrid, PathGrid>, true>;

export declare const solution1: Solve1<64>;

type Solve2<TSteps extends number> = [
  bigint.Div<bigint.Sub<TSteps, 65>, 131>[0],
  Solve1<64>,
  Solve1<65>,
  Solve1<130>,
  Solve1<131>,
] extends [
  infer IScale extends string,
  infer ICenterEven extends number,
  infer ICenterOdd extends number,
  infer ITotalEven extends number,
  infer ITotalOdd extends number,
]
  ? bigint.Add<
      bigint.Add<
        bigint.Mul<bigint.Pow<IScale, 2>, ICenterEven>,
        bigint.Mul<bigint.Pow<bigint.Inc<IScale>, 2>, ICenterOdd>
      >,
      bigint.Mul<
        bigint.Mul<IScale, bigint.Inc<IScale>>,
        bigint.Sub<bigint.Add<ITotalEven, ITotalOdd>, bigint.Add<ICenterEven, ICenterOdd>>
      >
    >
  : never;

export declare const solution2: Solve2<26501365>;
