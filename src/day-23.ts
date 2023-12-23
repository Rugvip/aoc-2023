import { Input } from '../input/23';
import { counter, int, grid, union, vec2 } from './lib';

// type Input1 = `#.#####################
// #.......#########...###
// #######.#########.#.###
// ###.....#.>.>.###.#.###
// ###v#####.#v#.###.#.###
// ###.>...#.#.#.....#...#
// ###v###.#.#.#########.#
// ###...#.#.#.......#...#
// #####.#.#.#######.#.###
// #.....#.#.#.......#...#
// #.#####.#.#.#########v#
// #.#...#...#...###...>.#
// #.#.#v#######v###.###v#
// #...#.>.#...>.>.#.###.#
// #####v#.#.###v#.#.###.#
// #.....#...#...#.#.#...#
// #.#########.###.#.#.###
// #...###...#...#...#.###
// ###.###.#.###v#####v###
// #...#...#.#.>.>.#.>.###
// #.###.###.#.###.#.#v###
// #.....###...###...#...#
// #####################.#
// `;

type Cell = '.' | '#' | vec2.Dir;

type NextSteps<TDir extends vec2.Dir> = vec2.Dir extends infer IDir extends vec2.Dir
  ? IDir extends vec2.FlipDir<TDir>
    ? never
    : vec2.Dir
  : never;

type TryStep<
  TGrid extends grid.Grid<Cell>,
  TPos extends vec2.Vec2,
  TDir extends vec2.Dir,
> = grid.AtVec2<TGrid, TPos> extends infer ICell extends Cell
  ? ICell extends '#'
    ? false
    : ICell extends '.'
    ? true
    : TDir extends ICell
    ? true
    : false
  : never;

type PosInSteps<
  TPos extends vec2.Vec2,
  TSteps extends string,
> = TSteps extends `${string};${TPos};${string}` ? true : false;

type CountSteps<
  TSteps extends string,
  TCounter extends counter.Counter = counter.Zero,
> = TSteps extends `${string};${infer IRest}`
  ? CountSteps<IRest, counter.Inc<TCounter>>
  : int.Subtract<counter.Value<TCounter>, 2>; // skip first step and trailing separator

type MaxPath<
  TGrid extends grid.Grid<Cell>,
  TEnd extends vec2.Vec2,
  TPrevDir extends vec2.Dir = 'v',
  TPos extends vec2.Vec2 = vec2.Vec2<1, 0>,
  TSteps extends string = ';1,0;',
> = TPos extends TEnd
  ? CountSteps<TSteps>
  : NextSteps<TPrevDir> extends infer INextDir extends vec2.Dir
  ? INextDir extends any
    ? grid.Vec2Step<TGrid, TPos, INextDir> extends infer INextPos extends vec2.Vec2
      ? TryStep<TGrid, INextPos, INextDir> extends true
        ? TSteps extends `${string};${INextPos};${string}`
          ? never
          : MaxPath<TGrid, TEnd, INextDir, INextPos, `${TSteps}${INextPos};`>
        : never
      : never
    : never
  : never;

type Parsed = grid.Parse<Input>;

export declare const solution1: union.Max<
  MaxPath<Parsed, vec2.Vec2<int.Subtract<grid.Width<Parsed>, 2>, int.Dec<grid.Height<Parsed>>>>
>;
