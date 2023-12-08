import { Input } from '../input/08';
import { Expand } from './lib/utils';
import { array } from './lib/array';
import { counter } from './lib/counter';

type Turn = 'L' | 'R';
type Map = { [K in string]: { L: string; R: string } };

type ParseTurns<TInput extends string> = TInput extends `${infer IHead}${infer IRest}`
  ? [IHead, ...ParseTurns<IRest>]
  : [];

type ParseMap<
  TMap extends string,
  TResult extends Map = {},
  TMapSizeCounter extends any[] = [],
> = TMap extends `${infer IHead}\n${infer IRest}`
  ? IHead extends `${infer IKey} = (${infer ILeft}, ${infer IRight})`
    ? ParseMap<IRest, TResult & { [K in IKey]: { L: ILeft; R: IRight } }, [...TMapSizeCounter, any]>
    : never
  : { entries: Expand<TResult>; size: TMapSizeCounter['length'] };

type ParseInput<TInput extends string> = TInput extends `${infer ITurns}\n\n${infer IMap}`
  ? ParseMap<IMap> extends {
      entries: infer IMapEntries extends Map;
      size: infer IMapSize extends number;
    }
    ? {
        turns: ParseTurns<ITurns>;
        map: IMapEntries;
        size: IMapSize;
      }
    : never
  : never;

// type Input = `LLR

// AAA = (BBB, BBB)
// BBB = (AAA, ZZZ)
// ZZZ = (ZZZ, ZZZ)
// `;

// type Input = `LR

// 11A = (11B, XXX)
// 11B = (XXX, 11Z)
// 11Z = (11B, XXX)
// 22A = (22B, XXX)
// 22B = (22C, 22C)
// 22C = (22Z, 22Z)
// 22Z = (22B, 22B)
// XXX = (XXX, XXX)
// `;

// As discovered through experimentation, each starting point in part 2 only has a single unique end point.
type SolveImpl<
  TTurns extends Turn[],
  TMap extends Map,
  TLocation extends keyof TMap,
  TStops extends keyof TMap,
  TCounter extends counter.Counter = counter.Make<0>,
> = [TLocation] extends [TStops]
  ? counter.Value<TCounter>
  : TTurns extends [infer INextTurn extends Turn, ...infer IRestTurns extends Turn[]]
  ? TMap[TLocation][INextTurn] extends infer INextLocation extends keyof TMap
    ? SolveImpl<[...IRestTurns, INextTurn], TMap, INextLocation, TStops, counter.Inc<TCounter>>
    : never
  : never;

type Solve<
  TInput extends { turns: Turn[]; map: Map; size: number },
  TStart extends string,
  TEnd extends string,
> = keyof TInput['map'] & TStart extends infer IStart extends keyof TInput['map']
  ? IStart extends any
    ? SolveImpl<TInput['turns'], TInput['map'], IStart, keyof TInput['map'] & TEnd>
    : never
  : never;

export declare const solution1: Solve<ParseInput<Input>, 'AAA', 'ZZZ'>;

// TODO: Finding GCD and LCM of these results is currently a manual step
export declare const solution2: Solve<ParseInput<Input>, `${string}A`, `${string}Z`>;
