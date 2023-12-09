import { Input } from '../input/09';
import { int } from './lib/math';

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

type ComputeNextRow<TData extends number[]> = TData extends [
  infer IA extends number,
  infer IB extends number,
  ...infer IRest extends number[],
]
  ? [int.Subtract<IB, IA>, ...ComputeNextRow<[IB, ...IRest]>]
  : [];

type ComputeDifferences<TData extends number[]> =
  ComputeNextRow<TData> extends infer INextRow extends number[]
    ? INextRow extends []
      ? []
      : [TData, ...ComputeDifferences<INextRow>]
    : never;

type PickLast<TData extends any[][]> = TData extends [
  infer INextRow extends any[],
  ...infer IRestRows extends any[][],
]
  ? INextRow extends [...any, infer ILast]
    ? [ILast, ...PickLast<IRestRows>]
    : []
  : [];

type Extrapolate<TData extends number[]> = int.Sum<PickLast<ComputeDifferences<TData>>>;

type Solve<TData extends number[][], TExtrapolated extends number[] = []> = TData extends [
  infer IData extends number[],
  ...infer IRestData extends number[][],
]
  ? Solve<IRestData, [...TExtrapolated, Extrapolate<IData>]>
  : int.Sum<TExtrapolated>;

export declare const solution1: Solve<ParseInput<Input>>;
