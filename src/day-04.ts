import { Input } from '../input/04';
import { int } from './lib/math';
import { parser } from './lib/parser';
import { union } from './lib/union';

// type Input = `Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
// Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
// Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
// Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
// Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
// Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11
// `;

type ParsedInput = parser.Parse<
  Input,
  `[cards: lines]`,
  {
    cards: 'Card {number}: [cards: ssv] | [winning: ssv]';
  }
>['cards'];

type Row = { cards: string[]; winning: string[] };

type ScoreUnion<U, TResult extends any[] = []> = union.Pop<U> extends { rest: infer IRest }
  ? ScoreUnion<IRest, TResult extends [] ? [any] : [...TResult, ...TResult]>
  : TResult['length'];

type ScoreRows<TRows extends Row[], TResult extends number = 0> = TRows extends [
  infer IRow extends Row,
  ...infer IRest extends Row[],
]
  ? ScoreRows<IRest, int.Add<TResult, ScoreUnion<IRow['cards'][number] & IRow['winning'][number]>>>
  : TResult;

export declare const solution1: ScoreRows<ParsedInput>;

type SizeUnion<U, TResult extends any[] = []> = union.Pop<U> extends { rest: infer IRest }
  ? SizeUnion<IRest, TResult extends [] ? [any] : [...TResult, any]>
  : TResult;

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
        Intersperse<
          IRestDeferred,
          SizeUnion<IRow['cards'][number] & IRow['winning'][number]>,
          ICopies
        >,
        int.Add<TResult, ICopies>
      >
    : never
  : TResult;

export declare const solution2: ReduceRows<ParsedInput>;
