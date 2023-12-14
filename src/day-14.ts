import { Input } from '../input/14';
import { grid, counter, int, strings } from './lib';

// type Input1 = `O....#....
// O.OO#....#
// .....##...
// OO.#O....O
// .O.....O#.
// O.#..O.#.#
// ..O..#O..O
// .......O..
// #....###..
// #OO..#....
// `;

type Parsed = grid.Parse<Input>;

type GridSize = Parsed['length'];

type MakeLookupTable<
  TChar extends string,
  TAcc extends string[] = [],
  TResult extends string[][] = [],
> = TResult['length'] extends GridSize
  ? TResult
  : MakeLookupTable<TChar, [...TAcc, TChar], [...TResult, TAcc]>;

type EmptyTable = MakeLookupTable<'.'>;
type LooseTable = MakeLookupTable<'O'>;

type CompactRowEnd<
  TRow extends string[],
  TIter extends counter.Counter = counter.Dec<counter.Make<TRow['length']>>,
  TLooseCounter extends counter.Counter = counter.Zero,
  TEmptyCounter extends counter.Counter = counter.Zero,
  TResult extends string[] = [],
> = TIter extends counter.Done
  ? [
      ...EmptyTable[counter.Value<TEmptyCounter>],
      ...LooseTable[counter.Value<TLooseCounter>],
      ...TResult,
    ]
  : TRow[counter.Value<TIter>] extends infer IChar extends string
  ? IChar extends '#'
    ? CompactRowEnd<
        TRow,
        counter.Dec<TIter>,
        counter.Zero,
        counter.Zero,
        [
          IChar,
          ...EmptyTable[counter.Value<TEmptyCounter>],
          ...LooseTable[counter.Value<TLooseCounter>],
          ...TResult,
        ]
      >
    : IChar extends 'O'
    ? CompactRowEnd<TRow, counter.Dec<TIter>, counter.Inc<TLooseCounter>, TEmptyCounter, TResult>
    : CompactRowEnd<TRow, counter.Dec<TIter>, TLooseCounter, counter.Inc<TEmptyCounter>, TResult>
  : never;

type CompactAndRotateRight<TGrid extends grid.Grid<string>> =
  TGrid[0] extends infer IRow extends string[]
    ? {
        [X in keyof IRow]: CompactRowEnd<grid.ReverseColumnAt<TGrid, X>>;
      }
    : never;

type CycleOnce<TGrid extends grid.Grid<string>> = CompactAndRotateRight<
  CompactAndRotateRight<CompactAndRotateRight<CompactAndRotateRight<TGrid>>>
>;

type ScoreRow<
  TRow extends string[],
  TIter extends counter.Counter = counter.Zero,
  TScore extends counter.Counter = counter.Zero,
> = counter.Value<TIter> extends TRow['length']
  ? counter.Value<TScore>
  : ScoreRow<
      TRow,
      counter.Inc<TIter>,
      TRow[counter.Value<TIter>] extends 'O' ? counter.Inc<TScore> : TScore
    >;

type ScoreGridNorth<
  TGrid extends grid.Grid<string>,
  TRowCounter extends counter.Counter = counter.Zero,
  TResult extends number = 0,
> = counter.Value<TRowCounter> extends grid.Height<TGrid>
  ? TResult
  : ScoreGridNorth<
      TGrid,
      counter.Inc<TRowCounter>,
      int.Add<
        TResult,
        int.Multiply<
          ScoreRow<TGrid[counter.Value<TRowCounter>]>,
          int.Subtract<grid.Height<TGrid>, counter.Value<TRowCounter>>
        >
      >
    >;

type Cycle<
  TCount extends number,
  TGrid extends grid.Grid<string>,
  TCounter extends counter.Counter = counter.Make<TCount>,
> = TCounter extends counter.Zero ? TGrid : Cycle<TCount, CycleOnce<TGrid>, counter.Dec<TCounter>>;

type RepetitionsImpl<
  TGrid extends grid.Grid<string>,
  TFirstHalf extends number[],
  TSecondHalf extends number[],
> = TFirstHalf extends TSecondHalf
  ? TFirstHalf
  : TSecondHalf extends [infer IMoved extends number, ...infer IRest extends number[]]
  ? RepetitionsImpl<
      CycleOnce<CycleOnce<TGrid>>,
      [...TFirstHalf, IMoved],
      [...IRest, ScoreGridNorth<CycleOnce<TGrid>>, ScoreGridNorth<CycleOnce<CycleOnce<TGrid>>>]
    >
  : never;

type Repetitions<TGrid extends grid.Grid<string>> = RepetitionsImpl<
  CycleOnce<TGrid>,
  [ScoreGridNorth<TGrid>],
  [ScoreGridNorth<CycleOnce<TGrid>>]
>;

export declare const solution1: ScoreGridNorth<grid.RotateLeft<CompactAndRotateRight<Parsed>>>;

type Solve2<TGrid extends grid.Grid<string>, TCycleSearchStart extends number> = Repetitions<
  Cycle<TCycleSearchStart, Parsed>
> extends infer IRepetitions extends number[]
  ? `[${strings.Join<
      IRepetitions,
      ', '
    >}][(1000000000 - ${TCycleSearchStart}) % ${IRepetitions['length']}]`
  : never;

// TODO: manual calculation for now
export declare const solution2: Solve2<Parsed, 200>;
