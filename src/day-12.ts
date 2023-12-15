import { Input } from '../input/12';
import { parser, int, union, counter, strings, array } from './lib';

// type Input1 = `???.### 1,1,3
// .??..??...?##. 1,1,3
// ?#?#?#?#?#?#?#? 1,3,1,6
// ????.#...#... 4,1,1
// ????.######..#####. 1,6,5
// ?###???????? 3,2,1
// `;

type ParsedRow = { left: string; right: number[] };

type Parsed = parser.Parse<
  Input,
  '[rows: lines]',
  { rows: '{left: string} [right: numbers]' }
>['rows'];

type Unfold<TRows extends ParsedRow[], TResult extends ParsedRow[] = []> = {
  [I in keyof TRows]: TRows[I] extends {
    left: infer ILeft extends string;
    right: infer IRight extends number[];
  }
    ? {
        left: `${ILeft}?${ILeft}?${ILeft}?${ILeft}?${ILeft}`;
        right: [...IRight, ...IRight, ...IRight, ...IRight, ...IRight];
      }
    : never;
};

type SplitStrAt<
  S extends string,
  TIndex extends number,
  TCounter extends counter.Counter = counter.Make<TIndex>,
  TLeading extends string = '',
> = TCounter extends counter.Zero
  ? [leading: TLeading, trailing: S]
  : S extends `${infer IHead}${infer ITail}`
  ? SplitStrAt<ITail, TIndex, counter.Dec<TCounter>, `${TLeading}${IHead}`>
  : never;

type StrLen<
  S extends string,
  TCounter extends counter.Counter = counter.Zero,
> = S extends `${string}${infer IRest}`
  ? StrLen<IRest, counter.Inc<TCounter>>
  : counter.Value<TCounter>;

type CountOptions<TPatterns extends string, TSizes extends number[]> = TSizes extends []
  ? TPatterns extends `${string}#${string}`
    ? 0
    : 1
  : int.Add<
      TPatterns extends `${infer INext extends string}${infer IRest extends string}`
        ? INext extends '#'
          ? 0
          : CountOptions<IRest, TSizes>
        : 0,
      TSizes extends [infer INextSize extends number, ...infer IRestSizes extends number[]]
        ? SplitStrAt<TPatterns, INextSize> extends [
            infer ITaken extends string,
            infer IAfter extends string,
          ]
          ? StrLen<ITaken> extends INextSize
            ? ITaken extends `${string}.${string}`
              ? 0
              : IAfter extends `${infer INext extends string}${infer IRest extends string}`
              ? INext extends '#'
                ? 0
                : CountOptions<IRest, IRestSizes>
              : IRestSizes extends []
              ? 1
              : 0
            : never
          : 0
        : never
    >;

type Solve<
  TRows extends { left: string; right: number[] }[],
  TIter extends counter.Counter = counter.Dec<counter.Make<TRows['length']>>,
  TSum extends number = 0,
> = TIter extends counter.Done
  ? TSum
  : Solve<
      TRows,
      counter.Dec<TIter>,
      int.Add<
        TSum,
        TRows[counter.Value<TIter>] extends {
          left: infer ILeft extends string;
          right: infer IRight extends number[];
        }
          ? CountOptions<ILeft, IRight>
          : never
      >
    >;

export declare const solution1: Solve<Parsed>;
export declare const solution2: Solve<Unfold<Parsed>>;
