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

type Range<TStart extends number = number, TLength extends number = number> = {
  start: TStart;
  length: TLength;
};
type NumberMap<
  TStart extends number = number,
  TLength extends number = number,
  TTo extends number = number
> = Range<TStart, TLength> & { to: TTo };

type ParseInit<S extends string> =
  S extends `${infer INext extends number} ${infer IRest}`
    ? [INext, ...ParseInit<IRest>]
    : S extends `${infer ILast extends number}`
    ? [ILast]
    : never;

type ParseMap<S extends string> =
  S extends `${infer ITo extends number} ${infer IStart extends number} ${infer ILength extends number}`
    ? { start: IStart; to: ITo; length: ILength }
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
> = int.Compare<TNumber, TNumberMap['start']> extends 'lt'
  ? TNumber
  : int.Subtract<
      TNumber,
      TNumberMap['start']
    > extends infer IDiff extends number
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

type Solve1<T extends { init: number[]; groups: NumberMap[][] }> = int.Min<
  ApplyNumberMapGroups<T['init'][number], T['groups']>
>;

export declare const solution1: Solve1<ParseInput<Input>>;

// Part 2

type InitToRanges<TInit extends number[]> = TInit extends [
  infer IStart extends number,
  infer ILength extends number,
  ...infer IRest extends number[]
]
  ? [Range<IStart, ILength>, ...InitToRanges<IRest>]
  : [];

type ParseRangeInput<S extends string> =
  ParseInput<S> extends infer IResult extends {
    init: number[];
    groups: NumberMap[][];
  }
    ? { init: InitToRanges<IResult['init']>; groups: IResult['groups'] }
    : never;

type IntersectRange<TA extends Range, TB extends Range> = [
  TA['start'],
  TA['length'],
  int.Add<TA['start'], TA['length']>,
  TB['start'],
  TB['length'],
  int.Add<TB['start'], TB['length']>
] extends [
  infer AStart extends number,
  infer ALen extends number,
  infer AEnd extends number,
  infer BStart extends number,
  infer BLen extends number,
  infer BEnd extends number
]
  ? int.Compare<BEnd, AStart> extends 'lt' | 'eq'
    ? { slice: never; rest: TA }
    : int.Compare<AEnd, BStart> extends 'lt' | 'eq'
    ? { slice: never; rest: TA }
    : {
        lt: int.Subtract<BStart, AStart> extends infer ISliceLen extends number
          ? int.Compare<AEnd, BEnd> extends 'gt'
            ? {
                rest:
                  | Range<AStart, ISliceLen>
                  | Range<BEnd, int.Subtract<ALen, int.Add<ISliceLen, BLen>>>;
                slice: Range<BStart, BLen>;
              }
            : {
                rest: Range<AStart, ISliceLen>;
                slice: Range<BStart, int.Subtract<ALen, ISliceLen>>;
              }
          : never;
        eq: {
          lt: { slice: TA; rest: never };
          eq: { slice: TA; rest: never };
          gt: {
            slice: TB;
            rest: Range<AEnd, int.Subtract<ALen, BLen>>;
          };
        }[int.Compare<ALen, BLen>];
        gt: {
          lt: { slice: TA; rest: never };
          eq: { slice: TA; rest: never };
          gt: int.Subtract<BEnd, AStart> extends infer ISliceLen extends number
            ? {
                slice: Range<AStart, ISliceLen>;
                rest: Range<BEnd, int.Subtract<ALen, ISliceLen>>;
              }
            : never;
        }[int.Compare<AEnd, BEnd>];
      }[int.Compare<AStart, BStart>]
  : never;

type IntersectRanges<
  TRanges extends Range, // union
  TB extends Range
> = (
  TRanges extends any ? IntersectRange<TRanges, TB> : never
) extends infer I extends { slice: Range; rest: Range }
  ? { slice: I['slice']; rest: I['rest'] }
  : never;

type RangeApplyNumberMaps<
  TRange extends Range,
  TNumberMaps extends NumberMap[]
> = TNumberMaps extends [
  infer IMapHead extends NumberMap,
  ...infer IMapRest extends NumberMap[]
]
  ? IntersectRanges<TRange, IMapHead> extends {
      slice: infer ISlice extends Range;
      rest: infer IRest extends Range;
    }
    ?
        | ([ISlice] extends [never]
            ? never
            : ISlice extends any
            ? Range<
                int.Add<
                  ISlice['start'],
                  int.Subtract<IMapHead['to'], IMapHead['start']>
                >,
                ISlice['length']
              >
            : never)
        | RangeApplyNumberMaps<IRest, IMapRest>
    : never
  : TRange;

type RangeApplyNumberMapGroups<
  TRange extends Range,
  TGroup extends NumberMap[][]
> = TGroup extends [
  infer IFirst extends NumberMap[],
  ...infer IRest extends NumberMap[][]
]
  ? RangeApplyNumberMapGroups<RangeApplyNumberMaps<TRange, IFirst>, IRest>
  : TRange;

type Solve2<T extends { init: Range[]; groups: NumberMap[][] }> = int.Min<
  RangeApplyNumberMapGroups<T['init'][number], T['groups']>['start']
>;

export declare const solution2: Solve2<ParseRangeInput<Input>>;
