import { Input } from '../input/10';
import { array, int, union, counter, utils, grid, vec2 } from './lib';

// type Input1 = `-L|F7
// 7S-7|
// L|7||
// -L-J|
// L|-JF
// `;

// type Input2 = `7-F7-
// .FJ|7
// SJLL7
// |F--J
// LJ.LJ
// `;

type Dir = 'N' | 'E' | 'S' | 'W';

type MoveTable = {
  '.': { N: never; E: never; S: never; W: never };
  '|': { N: 'N'; E: never; S: 'S'; W: never };
  '-': { N: never; E: 'E'; S: never; W: 'W' };
  L: { N: never; E: never; S: 'E'; W: 'N' };
  F: { N: 'E'; E: never; S: never; W: 'S' };
  '7': { N: 'W'; E: 'S'; S: never; W: never };
  J: { N: never; E: 'N'; S: 'W'; W: never };
  S: { N: never; E: never; S: never; W: never };
};

type GridCell = keyof MoveTable;

type GridType = grid.Grid<GridCell>;

type TakeStep<TPos extends vec2.Vec2, TDir extends Dir> = TPos extends vec2.Vec2<infer IX, infer IY>
  ? vec2.Vec2<
      TDir extends 'E' ? int.Inc<IX> : TDir extends 'W' ? int.Dec<IX> : IX,
      TDir extends 'S' ? int.Inc<IY> : TDir extends 'N' ? int.Dec<IY> : IY
    >
  : never;

type FindStartPos<TGrid extends GridType, TRowCounter extends any[] = []> = TGrid extends [
  infer IRow extends GridCell[],
  ...infer IRestGrid extends GridType,
]
  ? {
      [K in keyof IRow]: IRow[K] extends 'S'
        ? vec2.Vec2<K extends `${infer X extends number}` ? X : never, TRowCounter['length']>
        : never;
    }[number] extends infer IStart
    ? [IStart] extends [never]
      ? FindStartPos<IRestGrid, [...TRowCounter, any]>
      : IStart
    : never
  : never;

type FindStartDir<TGrid extends GridType, TStartPos extends vec2.Vec2> = Dir &
  {
    [KDir in Dir]: [MoveTable[grid.AtVec2<TGrid, TakeStep<TStartPos, KDir>>][KDir]] extends [never]
      ? never
      : KDir;
  }[Dir];

type FindStart<TGrid extends GridType> =
  FindStartPos<TGrid> extends infer IStartPos extends vec2.Vec2
    ? [
        pos: IStartPos,
        dir: union.Pop<FindStartDir<TGrid, IStartPos>> extends { next: infer IDir extends Dir }
          ? IDir
          : never,
      ]
    : never;

type Step = [pos: vec2.Vec2, dir: Dir];

type StepGrid<TGrid extends GridType, TStep extends Step> = utils.Expand<
  TakeStep<TStep[0], TStep[1]>
> extends infer INextPos extends vec2.Vec2
  ? MoveTable[grid.AtVec2<TGrid, INextPos>][TStep[1]] extends infer INextDir extends Dir
    ? [INextDir] extends [never]
      ? never
      : [pos: INextPos, dir: INextDir]
    : never
  : never;

type MakeStepGrid<
  TGrid extends GridType,
  TStep extends Step = FindStart<TGrid>,
  TResultGrid extends grid.Grid<boolean> = grid.Make<false, grid.Width<TGrid>, grid.Height<TGrid>>,
> = grid.IterSet<TResultGrid, TStep[0], true> extends infer IResultGrid extends grid.Grid<boolean>
  ? StepGrid<TGrid, TStep> extends infer INextStep extends Step
    ? [INextStep] extends [never]
      ? IResultGrid
      : MakeStepGrid<TGrid, INextStep, IResultGrid>
    : never
  : never;

type Solve1<TGrid extends GridType> = int.Half<grid.Count<MakeStepGrid<TGrid>, true>>;

type InputGrid = grid.Parse<Input>;

export declare const solution1: Solve1<InputGrid>;
