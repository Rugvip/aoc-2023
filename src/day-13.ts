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

type ParseGrids<
  S extends string,
  TInputs extends string[] = strings.Split<strings.Trim<S, '\n'>, '\n\n'>,
  TResult extends grid.Grid<string>[] = [],
> = TInputs extends [infer IInput, ...infer IRest extends string[]]
  ? IInput extends string
    ? ParseGrids<'', IRest, [...TResult, grid.Parse<IInput>]>
    : never
  : TResult;

type CheckVerticalMirrorAt<
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
    : CheckVerticalMirrorAt<TGrid, X, counter.Dec<TACounter>, counter.Inc<TBCounter>>
  : false;

type CheckHorizontalMirrorAt<
  TGrid extends grid.Grid<string>,
  Y extends number,
  TACounter extends counter.Counter = counter.Make<Y>,
  TBCounter extends counter.Counter = counter.Inc<TACounter>,
> = grid.RowAt<TGrid, counter.Value<TACounter>> extends grid.RowAt<TGrid, counter.Value<TBCounter>>
  ? TACounter extends counter.Zero
    ? true
    : counter.Value<counter.Inc<TBCounter>> extends grid.Height<TGrid>
    ? true
    : CheckHorizontalMirrorAt<TGrid, Y, counter.Dec<TACounter>, counter.Inc<TBCounter>>
  : false;

type ScoreGrid<
  TGrid extends grid.Grid<string>,
  TCounter extends counter.Counter = counter.Make,
  TDir extends 'x' | 'y' = 'x',
> = TDir extends 'x'
  ? counter.Value<TCounter> extends grid.Width<TGrid>
    ? ScoreGrid<TGrid, counter.Make, 'y'>
    : CheckVerticalMirrorAt<TGrid, counter.Value<TCounter>> extends true
    ? counter.Value<counter.Inc<TCounter>>
    : ScoreGrid<TGrid, counter.Inc<TCounter>, TDir>
  : counter.Value<TCounter> extends grid.Height<TGrid>
  ? -1
  : CheckHorizontalMirrorAt<TGrid, counter.Value<TCounter>> extends true
  ? int.Multiply<counter.Value<counter.Inc<TCounter>>, 100>
  : ScoreGrid<TGrid, counter.Inc<TCounter>, TDir>;

type Solve<TGrids extends grid.Grid<string>[], TScore extends number = 0> = TGrids extends [
  infer IGrid,
  ...infer IRest extends grid.Grid<string>[],
]
  ? IGrid extends grid.Grid<string>
    ? Solve<IRest, int.Add<TScore, ScoreGrid<IGrid>>>
    : never
  : TScore;

type InputGrids = ParseGrids<Input>;

export declare const solution1: Solve<InputGrids>;
