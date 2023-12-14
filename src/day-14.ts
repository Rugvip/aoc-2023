import { Input } from '../input/14';
import { grid, counter, int } from './lib';

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

type TakeLoose<
  TRow extends string[],
  TRolling extends string[] = [],
  TEmpty extends string[] = [],
> = TRow extends [infer IHead extends string, ...infer IRest extends string[]]
  ? IHead extends '#'
    ? [loose: [...TRolling, ...TEmpty], rest: TRow]
    : IHead extends '.'
    ? TakeLoose<IRest, TRolling, [...TEmpty, IHead]>
    : TakeLoose<IRest, [...TRolling, IHead], TEmpty>
  : [loose: [...TRolling, ...TEmpty], rest: []];

type TakeFixed<TRow extends string[], TFixed extends string[] = []> = TRow extends [
  infer IHead extends string,
  ...infer IRest extends string[],
]
  ? IHead extends '#'
    ? TakeFixed<IRest, [...TFixed, IHead]>
    : [fixed: TFixed, rest: TRow]
  : [fixed: TFixed, rest: []];

type CompactRow<TRow extends string[], TResult extends string[] = []> = TRow extends []
  ? TResult
  : TakeLoose<TRow> extends [
      loose: infer ILoose extends string[],
      rest: infer IAfterLoose extends string[],
    ]
  ? TakeFixed<IAfterLoose> extends [
      fixed: infer IFixed extends string[],
      rest: infer IRest extends string[],
    ]
    ? CompactRow<IRest, [...TResult, ...ILoose, ...IFixed]>
    : never
  : never;

type CompactGrid<TGrid extends grid.Grid<string>> =
  grid.Transpose<TGrid> extends infer ITransposed extends grid.Grid<string>
    ? grid.Transpose<{ [KRow in keyof ITransposed]: CompactRow<ITransposed[KRow]> }>
    : never;

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

type ScoreGrid<
  TGrid extends grid.Grid<string>,
  TRowCounter extends counter.Counter = counter.Zero,
  TResult extends number = 0,
> = counter.Value<TRowCounter> extends grid.Height<TGrid>
  ? TResult
  : ScoreGrid<
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

type Parsed = grid.Parse<Input>;

export declare const solution1: ScoreGrid<CompactGrid<Parsed>>;
