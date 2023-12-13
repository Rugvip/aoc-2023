import { Input } from '../input/13';
import { strings, grid, counter, int } from './lib';

// type Input1 = `#.##..##.
// ..#.##.#.
// ##......#
// ##......#
// ..#.##.#.
// ..##..##.
// #.#.##.#.

// #...##..#
// #....#..#
// ..##..###
// #####.##.
// #####.##.
// ..##..###
// #....#..#
// `;

type InputGrids = ParseGrids<Input>;

type ParseGrids<
  S extends string,
  TInputs extends string[] = strings.Split<strings.Trim<S, '\n'>, '\n\n'>,
  TResult extends grid.Grid<string>[] = [],
> = TInputs extends [infer IInput, ...infer IRest extends string[]]
  ? IInput extends string
    ? ParseGrids<'', IRest, [...TResult, grid.Parse<IInput>]>
    : never
  : TResult;

type CheckColMirrorAt<
  TGrid extends grid.Grid<string>,
  X extends number,
  TACounter extends counter.Counter = counter.Make<X>,
  TBCounter extends counter.Counter = counter.Inc<TACounter>,
> = grid.ColumnAt<TGrid, counter.Value<TACounter>> extends grid.ColumnAt<
  TGrid,
  counter.Value<TBCounter>
>
  ? TACounter extends counter.Zero
    ? true
    : counter.Value<counter.Inc<TBCounter>> extends grid.Width<TGrid>
    ? true
    : CheckColMirrorAt<TGrid, X, counter.Dec<TACounter>, counter.Inc<TBCounter>>
  : false;

type CheckRowMirrorAt<
  TGrid extends grid.Grid<string>,
  Y extends number,
  TACounter extends counter.Counter = counter.Make<Y>,
  TBCounter extends counter.Counter = counter.Inc<TACounter>,
> = grid.RowAt<TGrid, counter.Value<TACounter>> extends grid.RowAt<TGrid, counter.Value<TBCounter>>
  ? TACounter extends counter.Zero
    ? true
    : counter.Value<counter.Inc<TBCounter>> extends grid.Height<TGrid>
    ? true
    : CheckRowMirrorAt<TGrid, Y, counter.Dec<TACounter>, counter.Inc<TBCounter>>
  : false;

type MirrorDir = 'cols' | 'rows';
type Mirror<TDir extends MirrorDir = MirrorDir, TIndex extends number = number> = TDir | TIndex;

type NextFindMirror<
  TGrid extends grid.Grid<string>,
  TSkip extends Mirror = never,
  TCounter extends counter.Counter = counter.Zero,
  TDir extends MirrorDir = 'cols',
> = TDir extends 'cols'
  ? counter.Value<TCounter> extends grid.Width<TGrid>
    ? FindMirror<TGrid, TSkip, counter.Zero, 'rows'>
    : FindMirror<TGrid, TSkip, counter.Inc<TCounter>, TDir>
  : counter.Value<TCounter> extends grid.Height<TGrid>
  ? never
  : FindMirror<TGrid, TSkip, counter.Inc<TCounter>, TDir>;

type FindMirror<
  TGrid extends grid.Grid<string>,
  TSkip extends Mirror = never,
  TCounter extends counter.Counter = counter.Zero,
  TDir extends MirrorDir = 'cols',
> = [counter.Value<TCounter> | TDir] extends [TSkip]
  ? NextFindMirror<TGrid, TSkip, TCounter, TDir>
  : TDir extends 'cols'
  ? CheckColMirrorAt<TGrid, counter.Value<TCounter>> extends true
    ? TDir | counter.Value<TCounter>
    : NextFindMirror<TGrid, TSkip, TCounter, TDir>
  : CheckRowMirrorAt<TGrid, counter.Value<TCounter>> extends true
  ? TDir | counter.Value<TCounter>
  : NextFindMirror<TGrid, TSkip, TCounter, TDir>;

type MirrorScore<TMirror extends Mirror> = [TMirror] extends [never]
  ? 0
  : [TMirror & string] extends ['cols']
  ? int.Inc<TMirror & number>
  : [TMirror & string] extends ['rows']
  ? int.Multiply<int.Inc<TMirror & number>, 100>
  : 0;

type Solve1<TGrids extends grid.Grid<string>[], TScore extends number = 0> = TGrids extends [
  infer IGrid,
  ...infer IRest extends grid.Grid<string>[],
]
  ? IGrid extends grid.Grid<string>
    ? Solve1<IRest, int.Add<TScore, MirrorScore<FindMirror<IGrid>>>>
    : never
  : TScore;

export declare const solution1: Solve1<InputGrids>;

type FindSmudgeMirror<
  TGrid extends grid.Grid<string>,
  TFirstMirror extends Mirror,
  TIter extends grid.Iter = grid.IterZero,
> = TIter extends grid.IterDone
  ? never
  : FindMirror<
      grid.Vec2Map<TGrid, TIter, { '.': '#'; '#': '.' }>,
      TFirstMirror
    > extends infer IMirror extends Mirror
  ? [IMirror] extends [never]
    ? FindSmudgeMirror<TGrid, TFirstMirror, grid.IterNext<TGrid, TIter>>
    : IMirror
  : never;

type Solve2<TGrids extends grid.Grid<string>[], TScore extends number = 0> = TGrids extends [
  infer IGrid,
  ...infer IRest extends grid.Grid<string>[],
]
  ? IGrid extends grid.Grid<string>
    ? Solve2<IRest, int.Add<TScore, MirrorScore<FindSmudgeMirror<IGrid, FindMirror<IGrid>>>>>
    : never
  : TScore;

export declare const solution2: Solve2<InputGrids>;
