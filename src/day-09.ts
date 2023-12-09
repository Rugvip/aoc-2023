import { Input } from '../input/09';
import { int } from './lib/math';
import { array } from './lib/array';

// type Input = `0 3 6 9 12 15
// 1 3 6 10 15 21
// 10 13 16 21 30 45
// `;

type ParseNumber<S extends string> = S extends `${infer N extends number}` ? N : never;

type ParseNumbers<S extends string> = S extends `${infer IHead} ${infer IRest}`
  ? [ParseNumber<IHead>, ...ParseNumbers<IRest>]
  : [ParseNumber<S>];

type ParseInput<TInput extends string> = TInput extends `${infer ILine}\n${infer IRest}`
  ? [ParseNumbers<ILine>, ...ParseInput<IRest>]
  : [];

type Differences<TData extends number[]> = TData extends [
  infer IA extends number,
  infer IB extends number,
  ...infer IRest extends number[],
]
  ? [int.Subtract<IB, IA>, ...Differences<[IB, ...IRest]>]
  : [];

type DifferenceTable<TData extends number[]> =
  Differences<TData> extends infer INextRow extends number[]
    ? INextRow[number] extends 0
      ? [TData, INextRow]
      : INextRow extends []
      ? []
      : [TData, ...DifferenceTable<INextRow>]
    : never;

type Direction = '<' | '>';

type Extrapolate<
  TDirection extends Direction,
  TData extends number[],
  TResult extends number = 0,
> = TData extends [...infer IRest extends number[], infer ILast extends number]
  ? Extrapolate<
      TDirection,
      IRest,
      TDirection extends '>' ? int.Add<ILast, TResult> : int.Subtract<ILast, TResult>
    >
  : TResult;

type Solve<
  TDirection extends Direction,
  TData extends number[][],
  TExtrapolated extends number[] = [],
> = TData extends [infer IData extends number[], ...infer IRestData extends number[][]]
  ? Solve<
      TDirection,
      IRestData,
      [
        ...TExtrapolated,
        Extrapolate<
          TDirection,
          array.EachAt<DifferenceTable<IData>, TDirection extends '<' ? 0 : -1>
        >,
      ]
    >
  : int.Sum<TExtrapolated>;

export declare const solution1: Solve<'>', ParseInput<Input>>;
export declare const solution2: Solve<'<', ParseInput<Input>>;
