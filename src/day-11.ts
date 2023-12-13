import { Input } from '../input/11';
import { int, array, utils, counter, grid, vec2 } from './lib';

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

type Galaxy = vec2.Vec2;
type Expansions = { rows: number[]; cols: number[] };

type LocateGalaxies<
  TUniverse extends grid.Grid<string>,
  TIter extends grid.Iter = grid.IterZero,
  TGalaxies extends Galaxy[] = [],
> = TIter extends grid.IterDone
  ? TGalaxies
  : grid.AtVec2<TUniverse, TIter> extends '#'
  ? LocateGalaxies<TUniverse, grid.IterNext<TUniverse, TIter>, [...TGalaxies, TIter]>
  : LocateGalaxies<TUniverse, grid.IterNext<TUniverse, TIter>, TGalaxies>;

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
  TCounter extends counter.Counter = counter.Zero,
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
> = vec2.Vec2<
  vec2.ManhattanDistance<TA, TB>,
  int.Add<
    CountBetween<TExpansions['cols'], vec2.X<TA>, vec2.X<TB>>,
    CountBetween<TExpansions['rows'], vec2.Y<TA>, vec2.Y<TB>>
  >
>;

type GalaxyDistances<
  TGalaxies extends Galaxy[],
  TExpansions extends Expansions,
  TACounter extends counter.Counter,
  TBCounter extends counter.Counter = counter.Inc<TACounter>,
  TSums extends vec2.Vec2 = vec2.Zero,
> = counter.Value<TBCounter> extends TGalaxies['length']
  ? TSums
  : GalaxyDistances<
      TGalaxies,
      TExpansions,
      TACounter,
      counter.Inc<TBCounter>,
      vec2.Add<
        TSums,
        GalaxyDistance<
          TGalaxies[counter.Value<TACounter>],
          TGalaxies[counter.Value<TBCounter>],
          TExpansions
        >
      >
    >;

type SumGalaxyDistances<
  TGalaxies extends Galaxy[],
  TExpansions extends Expansions,
  TCounter extends counter.Counter = counter.Zero,
  TSums extends vec2.Vec2 = vec2.Zero,
> = counter.Value<TCounter> extends TGalaxies['length']
  ? TSums
  : SumGalaxyDistances<
      TGalaxies,
      TExpansions,
      counter.Inc<TCounter>,
      vec2.Add<TSums, GalaxyDistances<TGalaxies, TExpansions, TCounter>>
    >;

type Solve<TUniverse extends string[][], TExpansionFactor extends number> = SumGalaxyDistances<
  LocateGalaxies<TUniverse>,
  FindExpansions<TUniverse>
> extends vec2.Vec2<infer IDistance extends number, infer IExpansions extends number>
  ? int.Add<IDistance, int.Multiply<IExpansions, int.Dec<TExpansionFactor>>>
  : never;

type Universe = grid.Parse<Input>;

export declare const solution1: Solve<Universe, 2>;
export declare const solution2: Solve<Universe, 1000000>;
