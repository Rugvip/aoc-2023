import { Input } from '../input/10';
import { array, int, union, counter, utils } from './lib';

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

type Grid = Segment[][];
type Dir = 'N' | 'E' | 'S' | 'W';
type Pos<X extends number = number, Y extends number = number> = [x: X, y: Y];

type SegmentType<
  N extends Dir = Dir,
  E extends Dir = Dir,
  S extends Dir = Dir,
  W extends Dir = Dir,
> = { N: N; E: E; S: S; W: W };

type SegmentTypes = {
  '.': SegmentType<never, never, never, never>;
  '|': SegmentType<'N', never, 'S', never>;
  '-': SegmentType<never, 'E', never, 'W'>;
  L: SegmentType<never, never, 'E', 'N'>;
  F: SegmentType<'E', never, never, 'S'>;
  '7': SegmentType<'W', 'S', never, never>;
  J: SegmentType<never, 'N', 'W', never>;
  S: 'start';
};

type Segment = SegmentTypes[keyof SegmentTypes];

type ParseRow<S extends string> =
  S extends `${infer IChar extends keyof SegmentTypes}${infer IRest}`
    ? [SegmentTypes[IChar], ...ParseRow<IRest>]
    : [];

type ParseGrid<S extends string, Rows extends any[] = []> = S extends `${infer Line}\n${infer Rest}`
  ? ParseGrid<Rest, [...Rows, [SegmentTypes['.'], ...ParseRow<Line>, SegmentTypes['.']]]>
  : array.Make<Rows[0]['length'], SegmentTypes['.']> extends infer IPadRow extends Segment[]
  ? [IPadRow, ...Rows, IPadRow]
  : never;

type GridPos<TGrid extends Grid, TPos extends Pos> = TGrid[TPos[1]][TPos[0]];

type DirDelta = {
  N: Pos<0, -1>;
  E: Pos<1, 0>;
  S: Pos<0, 1>;
  W: Pos<-1, 0>;
};

type AddPos<TPos1 extends Pos, TPos2 extends Pos> = [
  x: int.Add<TPos1[0], TPos2[0]>,
  y: int.Add<TPos1[1], TPos2[1]>,
];

type FindStartPos<TGrid extends Grid, TRowCounter extends any[] = []> = TGrid extends [
  infer IRow extends Segment[],
  ...infer IRestGrid extends Grid,
]
  ? {
      [K in keyof IRow]: IRow[K] extends 'start'
        ? [x: K extends `${infer X extends number}` ? X : never, y: TRowCounter['length']]
        : never;
    }[number] extends infer IStart
    ? [IStart] extends [never]
      ? FindStartPos<IRestGrid, [...TRowCounter, any]>
      : IStart
    : never
  : never;

type FindStartDir<TGrid extends Grid, TStartPos extends Pos> = Dir &
  {
    [KDir in Dir]: [
      Exclude<GridPos<TGrid, AddPos<TStartPos, DirDelta[KDir]>>, 'start'>[KDir],
    ] extends [never]
      ? never
      : KDir;
  }[Dir];

type FindStart<TGrid extends Grid> = FindStartPos<TGrid> extends infer IStartPos extends Pos
  ? {
      pos: IStartPos;
      dir: union.Pop<FindStartDir<TGrid, IStartPos>> extends { next: infer IDir extends Dir }
        ? IDir
        : never;
    }
  : never;

type Step = { pos: Pos; dir: Dir };

type StepGrid<TGrid extends Grid, TStep extends Step> = utils.Expand<
  AddPos<TStep['pos'], DirDelta[TStep['dir']]>
> extends infer INextPos extends Pos
  ? GridPos<TGrid, INextPos> extends infer INextSegment extends Segment
    ? INextSegment extends 'start'
      ? 'start'
      : { pos: INextPos; dir: Exclude<INextSegment, 'start'>[TStep['dir']] }
    : never
  : never;

type Solve1<
  TGrid extends Grid,
  TStep extends Step = FindStart<TGrid>,
  TCounter extends counter.Counter = counter.Make,
> = StepGrid<TGrid, TStep> extends infer INextStep extends Step | 'start'
  ? INextStep extends Step
    ? Solve1<TGrid, INextStep, counter.Inc<TCounter>>
    : int.Half<counter.Value<counter.Inc<TCounter>>>
  : never;

type InputGrid = ParseGrid<Input>;

export declare const solution1: Solve1<InputGrid>;
