import { Input } from '../input/11';
import { parser, int, array } from './lib';

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

type ParseInput<S extends string> = parser.Parse<S, '[ls: lines]', { ls: '[chars]' }>['ls'];

type ExpandAndTransposeUniverse<
  TUniverse extends string[][],
  TExpanded extends string[][] = [],
  TXCounter extends any[] = [],
> = TXCounter['length'] extends TUniverse[0]['length']
  ? TExpanded
  : array.EachAt<TUniverse, TXCounter['length']> extends infer IColumn extends string[]
  ? IColumn[number] extends '.'
    ? ExpandAndTransposeUniverse<TUniverse, [...TExpanded, IColumn, IColumn], [...TXCounter, any]>
    : ExpandAndTransposeUniverse<TUniverse, [...TExpanded, IColumn], [...TXCounter, any]>
  : never;

type ExpandUniverse<TUniverse extends string[][]> = ExpandAndTransposeUniverse<
  ExpandAndTransposeUniverse<TUniverse>
>;

type Galaxy = [x: number, y: number];

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

type GalaxyDistance<TA extends Galaxy, TB extends Galaxy> = int.Add<
  int.Abs<int.Subtract<TA[0], TB[0]>>,
  int.Abs<int.Subtract<TA[1], TB[1]>>
>;

type GalaxyDistances<
  TGalaxy extends Galaxy,
  TGalaxies extends Galaxy[],
  TSum extends number = 0,
> = TGalaxies extends [infer IGalaxy extends Galaxy, ...infer IRest extends Galaxy[]]
  ? GalaxyDistances<TGalaxy, IRest, int.Add<TSum, GalaxyDistance<TGalaxy, IGalaxy>>>
  : TSum;

type SumGalaxyDistances<TGalaxies extends Galaxy[], TSum extends number = 0> = TGalaxies extends [
  infer IGalaxy extends Galaxy,
  ...infer IRest extends Galaxy[],
]
  ? SumGalaxyDistances<IRest, GalaxyDistances<IGalaxy, IRest, TSum>>
  : TSum;

export declare const solution1: SumGalaxyDistances<
  LocateGalaxies<ExpandUniverse<ParseInput<Input>>>
>;
