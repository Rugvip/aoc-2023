import { Input } from '../input/05';
import { int } from './lib/math';

// type Input = `seeds: 79 14 55 13

// seed-to-soil map:
// 50 98 2
// 52 50 48

// soil-to-fertilizer map:
// 0 15 37
// 37 52 2
// 39 0 15

// fertilizer-to-water map:
// 49 53 8
// 0 11 42
// 42 0 7
// 57 7 4

// water-to-light map:
// 88 18 7
// 18 25 70

// light-to-temperature map:
// 45 77 23
// 81 45 19
// 68 64 13

// temperature-to-humidity map:
// 0 69 1
// 1 0 69

// humidity-to-location map:
// 60 56 37
// 56 93 4
// `;

type NumberMap = { from: number; to: number; length: number };

type ParseInit<S extends string> =
  S extends `${infer INext extends number} ${infer IRest}`
    ? INext | ParseInit<IRest>
    : S extends `${infer ILast extends number}`
    ? ILast
    : never;

type ParseMap<S extends string> =
  S extends `${infer ITo extends number} ${infer IFrom extends number} ${infer ILength extends number}`
    ? { from: IFrom; to: ITo; length: ILength }
    : never;

type ParseMaps<S extends string> = S extends `${infer IEntry}\n${infer IRest}`
  ? [ParseMap<IEntry>, ...ParseMaps<IRest>]
  : [ParseMap<S>];

type ParseGroup<S extends string> =
  S extends `${string}:\n${infer IMap}\n\n${infer IRest}`
    ? [ParseMaps<IMap>, ...ParseGroup<IRest>]
    : S extends `${string}:\n${infer IMap}${'\n'}`
    ? [ParseMaps<IMap>]
    : never;

type ParseInput<S extends string> =
  S extends `${string}: ${infer IInit}\n\n${infer IRest}`
    ? { init: ParseInit<IInit>; groups: ParseGroup<IRest> }
    : never;

type ApplyNumberMap<
  TNumber extends number,
  TNumberMap extends NumberMap
> = int.Compare<TNumber, TNumberMap['from']> extends 'lt'
  ? TNumber
  : int.Subtract<TNumber, TNumberMap['from']> extends infer IDiff extends number
  ? int.Compare<IDiff, TNumberMap['length']> extends 'lt'
    ? int.Add<TNumberMap['to'], IDiff>
    : TNumber
  : never;

type ApplyNumberMaps<
  TNumber extends number,
  TNumberMaps extends NumberMap[]
> = TNumberMaps extends [
  infer IFirst extends NumberMap,
  ...infer IRest extends NumberMap[]
]
  ? TNumber extends any
    ? ApplyNumberMap<TNumber, IFirst> extends infer IResult
      ? IResult extends TNumber
        ? ApplyNumberMaps<TNumber, IRest>
        : IResult
      : never
    : never
  : TNumber;

type ApplyNumberMapGroups<
  TNumber extends number,
  TGroup extends NumberMap[][]
> = TGroup extends [
  infer IFirst extends NumberMap[],
  ...infer IRest extends NumberMap[][]
]
  ? TNumber extends any
    ? ApplyNumberMapGroups<ApplyNumberMaps<TNumber, IFirst>, IRest>
    : never
  : TNumber;

type Solve1<T extends { init: number; groups: NumberMap[][] }> = int.Min<
  ApplyNumberMapGroups<T['init'], T['groups']>
>;

export declare const solution1: Solve1<ParseInput<Input>>;
