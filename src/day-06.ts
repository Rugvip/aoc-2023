import { Input } from '../input/06';
import { int } from './lib/math';
import { strings } from './lib/strings';

// type Input = `Time:      7  15   30
// Distance:  9  40  200
// `;

type Race<TTime extends number = number, TDistance extends number = number> = {
  time: TTime;
  distance: TDistance;
};

type ParseNumbers<S extends string> =
  strings.TrimLeft<S> extends `${infer INum extends number} ${infer IRest}`
    ? [INum, ...ParseNumbers<IRest>]
    : strings.Trim<S> extends `${infer INum extends number}`
    ? [INum]
    : [];

type PairEntries<TTimes extends number[], TDistances extends number[]> = [
  TTimes,
  TDistances,
] extends [
  [infer ITime extends number, ...infer IRestTimes extends number[]],
  [infer IDistance extends number, ...infer IRestDistances extends number[]],
]
  ? [Race<ITime, IDistance>, ...PairEntries<IRestTimes, IRestDistances>]
  : [];

type ParseInput<S extends string> = S extends `Time:${infer ITimes}\nDistance:${infer IDistances}\n`
  ? PairEntries<ParseNumbers<ITimes>, ParseNumbers<IDistances>>
  : never;

type ScoreAttempt<TTotalTime extends number, THoldTime extends number> = int.Multiply<
  int.Subtract<TTotalTime, THoldTime>,
  THoldTime
>;

type FindFirstSolution<
  TRace extends Race<number, number>,
  THoldBase extends number = 0,
  THoldCounter extends any[] = [],
> = int.Compare<
  ScoreAttempt<TRace['time'], int.Add<THoldCounter['length'], THoldBase>>,
  TRace['distance']
> extends 'gt'
  ? int.Add<THoldCounter['length'], THoldBase>
  : FindFirstSolution<TRace, THoldBase, [...THoldCounter, any]>;

type FindAfterLastSolution<
  TRace extends Race,
  THoldBase extends number = TRace['time'],
  THoldCounter extends any[] = [],
> = int.Compare<
  ScoreAttempt<TRace['time'], int.Subtract<THoldBase, THoldCounter['length']>>,
  TRace['distance']
> extends 'gt'
  ? int.Subtract<THoldBase, (THoldCounter extends [any, ...infer IRest] ? IRest : never)['length']>
  : FindAfterLastSolution<TRace, THoldBase, [...THoldCounter, any]>;

type Solve1<TRaces extends Race[], TResult extends number = 1> = TRaces extends [
  infer IRace extends Race,
  ...infer IRest extends Race[],
]
  ? Solve1<
      IRest,
      int.Multiply<TResult, int.Subtract<FindAfterLastSolution<IRace>, FindFirstSolution<IRace>>>
    >
  : TResult;

export declare const solution1: Solve1<ParseInput<Input>>;

// Part 2

type RemoveSpaces<S extends string> = S extends `${infer IChar} ${infer IRest}`
  ? `${IChar}${RemoveSpaces<IRest>}`
  : S;

type DropTwoOrdersOfMagnitude<N extends number> =
  `${N}` extends `${infer IN extends number}${int.Digit}${int.Digit}` ? IN : N;

type SearchFirstSolution<
  TRace extends Race<number, number>,
  TIncrement extends number = DropTwoOrdersOfMagnitude<TRace['time']>,
  THold extends number = 0,
> = int.Compare<ScoreAttempt<TRace['time'], THold>, TRace['distance']> extends 'gt'
  ? int.Compare<TIncrement, 1000> extends 'lt'
    ? FindFirstSolution<TRace, int.Subtract<THold, TIncrement>>
    : SearchFirstSolution<
        TRace,
        DropTwoOrdersOfMagnitude<TIncrement>,
        int.Subtract<THold, TIncrement>
      >
  : SearchFirstSolution<TRace, TIncrement, int.Add<THold, TIncrement>>;

type SearchAfterLastSolution<
  TRace extends Race<number, number>,
  TIncrement extends number = DropTwoOrdersOfMagnitude<TRace['time']>,
  THold extends number = TRace['time'],
> = int.Compare<ScoreAttempt<TRace['time'], THold>, TRace['distance']> extends 'gt'
  ? int.Compare<TIncrement, 1000> extends 'lt'
    ? FindAfterLastSolution<TRace, int.Add<THold, TIncrement>>
    : SearchAfterLastSolution<
        TRace,
        DropTwoOrdersOfMagnitude<TIncrement>,
        int.Add<THold, TIncrement>
      >
  : SearchAfterLastSolution<TRace, TIncrement, int.Subtract<THold, TIncrement>>;

type Solve2<TRace extends Race> = int.Subtract<
  SearchAfterLastSolution<TRace>,
  SearchFirstSolution<TRace>
>;

export declare const solution2: Solve2<ParseInput<RemoveSpaces<Input>>[0]>;
