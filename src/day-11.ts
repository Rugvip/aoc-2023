import { Input } from '../input/11';
import { int, array, utils, counter } from './lib';

// type Input1 = `...#......
// .......#..
// #.........
// ..........
// ......#...
// .#........
// .........#
// ..........
// .......#..
// #...#.....
// `;

type SplitChars<
  S extends string,
  TArr extends string[] = [],
> = S extends `${infer IChar}${infer IRest}` ? SplitChars<IRest, [...TArr, IChar]> : TArr;
type ParseGrid<
  S extends string,
  TRows extends any[] = [],
> = S extends `${infer ILine}\n${infer IRest}`
  ? ParseGrid<IRest, [...TRows, SplitChars<ILine>]>
  : TRows;

type Galaxy = [x: number, y: number];
type Expansions = { rows: number[]; cols: number[] };

type LocateGalaxiesRow<
  TRow extends string[],
  TY extends number,
  TGalaxies extends Galaxy[] = [],
  TXCounter extends any[] = [],
> = TRow extends [infer IChar extends string, ...infer IRest extends string[]]
  ? IChar extends '.'
    ? LocateGalaxiesRow<IRest, TY, TGalaxies, [...TXCounter, any]>
    : LocateGalaxiesRow<
        IRest,
        TY,
        [...TGalaxies, [x: TXCounter['length'], y: TY]],
        [...TXCounter, any]
      >
  : TGalaxies;

type LocateGalaxies<
  TGalaxy extends string[][],
  TYCounter extends any[] = [],
  TGalaxies extends [x: number, y: number][] = [],
> = TGalaxy extends [infer IRow extends string[], ...infer IRest extends string[][]]
  ? LocateGalaxies<
      IRest,
      [...TYCounter, any],
      [...TGalaxies, ...LocateGalaxiesRow<IRow, TYCounter['length']>]
    >
  : TGalaxies;

type FindExpansionRows<
  TUniverse extends string[][],
  TExpanded extends number[] = [],
  TYCounter extends any[] = [],
> = TYCounter['length'] extends TUniverse['length']
  ? TExpanded
  : array.At<TUniverse, TYCounter['length']>[number] extends '.'
  ? FindExpansionRows<TUniverse, [...TExpanded, TYCounter['length']], [...TYCounter, any]>
  : FindExpansionRows<TUniverse, TExpanded, [...TYCounter, any]>;

type FindExpansionColumns<
  TUniverse extends string[][],
  TExpanded extends number[] = [],
  TXCounter extends any[] = [],
> = TXCounter['length'] extends TUniverse[0]['length']
  ? TExpanded
  : array.EachAt<TUniverse, TXCounter['length']>[number] extends '.'
  ? FindExpansionColumns<TUniverse, [...TExpanded, TXCounter['length']], [...TXCounter, any]>
  : FindExpansionColumns<TUniverse, TExpanded, [...TXCounter, any]>;

type FindExpansions<TUniverse extends string[][]> = utils.Expand<{
  rows: FindExpansionRows<TUniverse>;
  cols: FindExpansionColumns<TUniverse>;
}>;

type CountBetweenImpl<
  TArr extends number[],
  TMin extends number,
  TMax extends number,
  TCounter extends counter.Counter = counter.Make,
  TDir extends 'lt' | 'gt' = 'lt',
> = TArr extends [infer INext extends number, ...infer IRest extends number[]]
  ? TDir extends 'lt'
    ? int.Compare<INext, TMin> extends 'lt'
      ? CountBetweenImpl<IRest, TMin, TMax, TCounter, 'lt'>
      : int.Compare<INext, TMax> extends 'gt'
      ? 0
      : CountBetweenImpl<IRest, TMin, TMax, counter.Inc<TCounter>, 'gt'>
    : int.Compare<INext, TMax> extends 'gt'
    ? counter.Value<TCounter>
    : CountBetweenImpl<IRest, TMin, TMax, counter.Inc<TCounter>, 'gt'>
  : counter.Value<TCounter>;

type CountBetween<TArr extends number[], TA extends number, TB extends number> = int.Compare<
  TA,
  TB
> extends 'lt'
  ? CountBetweenImpl<TArr, TA, TB>
  : CountBetweenImpl<TArr, TB, TA>;

type GalaxyDistance<
  TA extends Galaxy,
  TB extends Galaxy,
  TExpansions extends Expansions,
  TExpansionFactor extends number,
> = int.Add<
  int.Add<int.Abs<int.Subtract<TA[0], TB[0]>>, int.Abs<int.Subtract<TA[1], TB[1]>>>,
  int.Multiply<
    TExpansionFactor,
    int.Add<
      CountBetween<TExpansions['cols'], TA[0], TB[0]>,
      CountBetween<TExpansions['rows'], TA[1], TB[1]>
    >
  >
>;

type GalaxyDistances<
  TGalaxies extends Galaxy[],
  TExpansions extends Expansions,
  TExpansionFactor extends number,
  TACounter extends counter.Counter,
  TBCounter extends counter.Counter = counter.Inc<TACounter>,
  TSum extends number = 0,
> = counter.Value<TBCounter> extends TGalaxies['length']
  ? TSum
  : GalaxyDistances<
      TGalaxies,
      TExpansions,
      TExpansionFactor,
      TACounter,
      counter.Inc<TBCounter>,
      int.Add<
        TSum,
        GalaxyDistance<
          TGalaxies[counter.Value<TACounter>],
          TGalaxies[counter.Value<TBCounter>],
          TExpansions,
          TExpansionFactor
        >
      >
    >;

type SumGalaxyDistances<
  TGalaxies extends Galaxy[],
  TExpansions extends Expansions,
  TExpansionFactor extends number,
  TCounter extends counter.Counter = counter.Make,
  TSum extends number = 0,
> = counter.Value<TCounter> extends TGalaxies['length']
  ? TSum
  : SumGalaxyDistances<
      TGalaxies,
      TExpansions,
      TExpansionFactor,
      counter.Inc<TCounter>,
      int.Add<TSum, GalaxyDistances<TGalaxies, TExpansions, TExpansionFactor, TCounter>>
    >;

type Solve<TUniverse extends string[][], TExpansionFactor extends number> = SumGalaxyDistances<
  LocateGalaxies<TUniverse>,
  FindExpansions<TUniverse>,
  int.Dec<TExpansionFactor>
>;

type Universe = ParseGrid<Input>;

export declare const solution1: Solve<Universe, 2>;
export declare const solution2: Solve<Universe, 1000000>;
