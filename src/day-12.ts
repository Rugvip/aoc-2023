import { Input } from '../input/12';
import { parser, int, union, counter, strings, array } from './lib';

// type Input1 = `???.### 1,1,3
// .??..??...?##. 1,1,3
// ?#?#?#?#?#?#?#? 1,3,1,6
// ????.#...#... 4,1,1
// ????.######..#####. 1,6,5
// ?###???????? 3,2,1
// `;

type ParsedRow = { left: string[]; right: number[] };

type Parsed = parser.Parse<
  Input,
  '[rows: lines]',
  { rows: '[left: chars] [right: numbers]' }
>['rows'];

type MakeNPatternTable<
  S extends string,
  TPattern extends string = '',
  TTable extends string[] = [],
> = TTable['length'] extends 20
  ? TTable
  : MakeNPatternTable<S, `${TPattern}${S}`, [...TTable, TPattern]>;

type NPatternTable = MakeNPatternTable<'#'>;

type SomeDotPattern = '.' | '..' | '...' | '....' | '.....';

type MakeLeftPattern<S extends string[]> = strings.Join<array.Replace<S, '?', '.' | '#'>>;

type MakeRightPattern<
  TLeftPattern extends string[],
  TSizes extends number[],
  TPattern extends string = ``,
> = TLeftPattern extends [infer ILeft extends string, ...infer IRestLeft extends string[]]
  ? ILeft extends '.'
    ? MakeRightPattern<IRestLeft, TSizes, `${TPattern}.`>
    : 'skip' | 'take' extends infer ISkip
    ? ISkip extends 'skip'
      ? ILeft extends '?'
        ? MakeRightPattern<IRestLeft, TSizes, `${TPattern}.`>
        : never
      : TSizes extends [infer ISize extends number, ...infer IRestSizes extends number[]]
      ? array.All<array.TakeN<TLeftPattern, ISize>, '?' | '#'> extends true
        ? array.DropN<TLeftPattern, ISize> extends infer ILeftRestAfter extends string[]
          ? ILeftRestAfter extends []
            ? IRestSizes extends []
              ? `${TPattern}${NPatternTable[ISize]}`
              : never
            : ILeftRestAfter[0] extends '#'
            ? never
            : MakeRightPattern<
                array.DropN<ILeftRestAfter, 1>,
                IRestSizes,
                `${TPattern}${NPatternTable[ISize]}.`
              >
          : never
        : never
      : never
    : never
  : TSizes extends []
  ? TPattern
  : never;

type CountMatches<TRow extends ParsedRow> = union.Size<
  MakeLeftPattern<TRow['left']> & MakeRightPattern<TRow['left'], TRow['right']>
>;

type Solve1<
  TRows extends { left: string[]; right: number[] }[],
  TIter extends counter.Counter = counter.Zero,
  TSum extends number = 0,
> = counter.Value<TIter> extends TRows['length']
  ? TSum
  : Solve1<TRows, counter.Inc<TIter>, int.Add<TSum, CountMatches<TRows[counter.Value<TIter>]>>>;

export declare const solution1: Solve1<Parsed>;
