import { Input } from '../input/09';
import { int } from './lib/math';
import { array } from './lib/array';
import { parser } from './lib/parser';

// type Input = `0 3 6 9 12 15
// 1 3 6 10 15 21
// 10 13 16 21 30 45
// `;

type ParsedInput = parser.Parse<Input, '[lines: lines]', { lines: '[numbers]' }>['lines'];

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
  TDir extends Direction,
  TData extends number[],
  TResult extends number = 0,
> = TData extends [...infer IRest extends number[], infer ILast extends number]
  ? Extrapolate<
      TDir,
      IRest,
      TDir extends '>' ? int.Add<ILast, TResult> : int.Subtract<ILast, TResult>
    >
  : TResult;

type Solve<
  TDir extends Direction,
  TData extends number[][],
  TResult extends number = 0,
> = TData extends [infer IData extends number[], ...infer IRest extends number[][]]
  ? Solve<
      TDir,
      IRest,
      int.Add<
        TResult,
        Extrapolate<TDir, array.EachAt<DifferenceTable<IData>, TDir extends '<' ? 0 : -1>>
      >
    >
  : TResult;

export declare const solution1: Solve<'>', ParsedInput>;
export declare const solution2: Solve<'<', ParsedInput>;
