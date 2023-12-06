import { Input } from '../input/04';
import { int } from './lib/math';

type TrimRight<S extends string> = S extends ` ${infer IRest}` ? TrimLeft<IRest> : S;
type TrimLeft<S extends string> = S extends ` ${infer IRest}` ? TrimLeft<IRest> : S;
type Trim<S extends string> = TrimLeft<TrimRight<S>>;

type Row = { cards: string; winning: string };

type ParseCards<S extends string> = S extends `${infer ICard} ${infer IRest}`
  ? ICard | ParseCards<Trim<IRest>>
  : S;
type ParseInput<
  TInput extends string,
  TResult extends Row[] = [],
> = TInput extends `${string}: ${infer ICards} | ${infer IWinning}\n${infer IRest}`
  ? ParseInput<
      IRest,
      [...TResult, { cards: ParseCards<Trim<ICards>>; winning: ParseCards<Trim<IWinning>> }]
    >
  : TResult;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;
type PopUnion<U> = UnionToIntersection<U extends any ? () => U : never> extends () => infer R
  ? R
  : never;

type ScoreUnion<U, TResult extends any[] = [], TLast = PopUnion<U>> = [U] extends [never]
  ? TResult['length']
  : ScoreUnion<Exclude<U, TLast>, TResult extends [] ? [any] : [...TResult, ...TResult]>;

type ScoreRows<TRows extends Row[], TResult extends number = 0> = TRows extends [
  infer IRow extends Row,
  ...infer IRest extends Row[],
]
  ? ScoreRows<IRest, int.Add<TResult, ScoreUnion<IRow['cards'] & IRow['winning']>>>
  : TResult;

export declare const solution1: ScoreRows<ParseInput<Input>>;

type SizeUnion<U, TResult extends any[] = [], TLast = PopUnion<U>> = [U] extends [never]
  ? TResult
  : SizeUnion<Exclude<U, TLast>, TResult extends [] ? [any] : [...TResult, any]>;

type Intersperse<
  TNested extends number[],
  TArr extends any[],
  TSize extends number,
> = TArr extends [any, ...infer IRest extends any[]]
  ? TNested extends [infer INestedHead extends number, ...infer INestedRest extends number[]]
    ? [int.Add<INestedHead, TSize>, ...Intersperse<INestedRest, IRest, TSize>]
    : [TSize, ...Intersperse<[], IRest, TSize>]
  : TNested;

type ReduceRows<
  TRows extends Row[],
  TDeferred extends number[] = Intersperse<[], TRows, 1>,
  TResult extends number = 0,
> = TRows extends [infer IRow extends Row, ...infer IRestRows extends Row[]]
  ? TDeferred extends [infer ICopies extends number, ...infer IRestDeferred extends number[]]
    ? ReduceRows<
        IRestRows,
        Intersperse<IRestDeferred, SizeUnion<IRow['cards'] & IRow['winning']>, ICopies>,
        int.Add<TResult, ICopies>
      >
    : never
  : TResult;

export declare const solution2: ReduceRows<ParseInput<Input>>;
