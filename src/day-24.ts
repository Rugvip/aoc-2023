import { Input } from '../input/24';
import { array, counter, bigint, strings, union, utils } from './lib';

// type Input1 = `19, 13, 30 @ -2, 1, -2
// 18, 19, 22 @ -1, -1, -2
// 20, 25, 34 @ -2, -2, -4
// 12, 31, 28 @ -1, -2, -1
// 20, 19, 15 @ 1, -5, -3
// `;

type Hail<
  X extends string,
  Y extends string,
  Z extends string,
  DX extends string,
  DY extends string,
  DZ extends string,
> = `${X}, ${Y}, ${Z} @ ${DX}, ${DY}, ${DZ}`;

type TestIntersect<TA extends string, TB extends string> = TA extends Hail<
  infer XA extends string,
  infer YA extends string,
  any,
  infer DXA extends string,
  infer DYA extends string,
  any
>
  ? TB extends Hail<
      infer XB extends string,
      infer YB extends string,
      any,
      infer DXB extends string,
      infer DYB extends string,
      any
    >
    ? bigint.Sub<bigint.Mul<DXA, DYB>, bigint.Mul<DYA, DXB>> extends infer IDenom extends string
      ? IDenom extends '0'
        ? 'parallel'
        : bigint.Div<
            bigint.Sub<
              bigint.Add<bigint.Mul<YA, DXB>, bigint.Mul<DYB, XB>>,
              bigint.Add<bigint.Mul<YB, DXB>, bigint.Mul<DYB, XA>>
            >,
            IDenom
          >[0] extends infer TA extends string
        ? bigint.IsNegative<TA> extends true
          ? 'past-x'
          : WithinBounds<bigint.Add<XA, bigint.Mul<DXA, TA>>> extends true
          ? WithinBounds<bigint.Add<YA, bigint.Mul<DYA, TA>>> extends true
            ? bigint.IsNegative<
                bigint.Div<bigint.Add<bigint.Sub<XA, XB>, bigint.Mul<DXA, TA>>, DXB>[0]
              > extends true
              ? 'past-y'
              : true
            : 'out-y'
          : 'out-x'
        : never
      : never
    : never
  : never;

// type Min = '7';
// type Max = '27';
type Min = '200000000000000';
type Max = '400000000000000';

type WithinBounds<T extends string> = bigint.Compare<T, Min> extends 'lt'
  ? false
  : bigint.Compare<T, Max> extends 'gt'
  ? false
  : true;

type SolveImpl<
  TEntries extends string[],
  TLeft extends counter.Counter,
  TLeftEnd extends number,
  TCounter extends counter.Counter = counter.Zero,
  TRight extends counter.Counter = counter.Inc<TLeft>,
> = counter.Value<TLeft> extends TLeftEnd | TEntries['length']
  ? counter.Value<TCounter>
  : counter.Value<TRight> extends TEntries['length']
  ? SolveImpl<TEntries, counter.Inc<TLeft>, TLeftEnd, TCounter>
  : SolveImpl<
      TEntries,
      TLeft,
      TLeftEnd,
      TestIntersect<TEntries[counter.Value<TLeft>], TEntries[counter.Value<TRight>]> extends true
        ? counter.Inc<TCounter>
        : TCounter,
      counter.Inc<TRight>
    >;

type Solve<
  TInput extends string,
  TStart extends number = 0,
  TEnd extends number = 1000,
> = SolveImpl<strings.Split<strings.TrimRight<TInput, '\n'>, '\n'>, counter.Make<TStart>, TEnd>;

// Run with `yarn print sum 24 solution1`
export declare const solution1_0: Solve<Input, 0, 20>;
export declare const solution1_20: Solve<Input, 20, 45>;
export declare const solution1_45: Solve<Input, 45, 75>;
export declare const solution1_75: Solve<Input, 75, 110>;
export declare const solution1_110: Solve<Input, 110, 150>;
export declare const solution1_150: Solve<Input, 150, 200>;
export declare const solution1_200: Solve<Input, 200>;

type PrimeSieveFilter<TArr extends (number | null)[], N extends number | null> = {
  [K in keyof TArr]: TArr[K] extends null
    ? null
    : TArr[K] extends N
    ? N
    : bigint.Div<TArr[K] & number, N>[1] extends '0' // Faster than the actual sieve since we don't have array assignment
    ? null
    : TArr[K];
};

type PrimeSieve<
  TArr extends (number | null)[] = array.MakeCount<398, 2>,
  TCounter extends counter.Counter = counter.Zero,
> = counter.Value<TCounter> extends TArr['length']
  ? TArr
  : PrimeSieve<
      TArr[counter.Value<TCounter>] extends null
        ? TArr
        : PrimeSieveFilter<TArr, TArr[counter.Value<TCounter>]>,
      counter.Inc<TCounter>
    >;

type InterestingPrimes = array.DropN<array.Remove<PrimeSieve, null>, 15>;

type InterestingFactors<TBigN extends string> =
  InterestingPrimes[number] extends infer IPrime extends number
    ? IPrime extends any
      ? bigint.Div<TBigN, IPrime>[1] extends '0'
        ? IPrime
        : never
      : never
    : never;

type Differences<TArr extends string[], TResult extends string[] = []> = [
  ...TResult,
  any,
]['length'] extends infer INext extends keyof TArr
  ? INext extends TArr['length']
    ? TResult
    : Differences<TArr, [...TResult, bigint.Abs<bigint.Sub<TArr[0], TArr[INext] & string>>]>
  : never;

type ComponentNames = 'X' | 'Y' | 'Z';

type Component<TPos extends string = string, TSpeed extends string = string> = `${TPos},${TSpeed}`;
type ComponentPos<TComponent extends Component> = TComponent extends `${infer TPos},${any}`
  ? TPos
  : never;
type ComponentSpeed<TComponent extends Component> = TComponent extends `${any},${infer TSpeed}`
  ? TSpeed
  : never;

type SliceInput<
  TInput extends string,
  TXs extends Component[] = [],
  TYs extends Component[] = [],
  TZs extends Component[] = [],
> = TInput extends `${Hail<
  infer X,
  infer Y,
  infer Z,
  infer DX,
  infer DY,
  infer DZ
>}\n${infer IRest}`
  ? SliceInput<
      IRest,
      [...TXs, Component<X, DX>],
      [...TYs, Component<Y, DY>],
      [...TZs, Component<Z, DZ>]
    >
  : { X: TXs; Y: TYs; Z: TZs };

type ComponentSpeedTable<
  TComponents extends Component[],
  TCounter extends counter.Counter = counter.For<TComponents>,
  TResult extends { [_ in string]: string[] } = {},
> = TCounter extends counter.Done
  ? TResult
  : ComponentSpeedTable<
      TComponents,
      counter.Dec<TCounter>,
      TComponents[counter.Value<TCounter>] extends Component<infer Pos, infer Speed>
        ? Speed extends keyof TResult
          ? { [K in keyof TResult]: K extends Speed ? [...TResult[K], Pos] : TResult[K] }
          : TResult & { [_ in Speed]: [Pos] }
        : never
    >;

type FindSpeed<TComponents extends Component[], TTests extends number = -2 | -1 | 0 | 1 | 2> = (
  ComponentSpeedTable<TComponents> extends infer ISpeedTable extends { [_ in string]: string[] }
    ? {
        [K in keyof ISpeedTable as ISpeedTable[K]['length'] extends 1 | 2
          ? never
          : K]: InterestingFactors<Differences<ISpeedTable[K]>[any]>;
      }
    : never
) extends infer IFTable extends { [_ in string]: number }
  ? (
      union.Max<IFTable[keyof IFTable]> extends infer IFirstFactor extends number
        ? union.Max<
            Exclude<IFTable[keyof IFTable], IFirstFactor>
          > extends infer ISecondFactor extends number
          ? [
              first: [
                start: keyof {
                  [K in keyof IFTable as IFirstFactor extends IFTable[K] ? K : never]: never;
                },
                factor: `${IFirstFactor}`,
              ],
              second: [
                start: keyof {
                  [K in keyof IFTable as ISecondFactor extends IFTable[K] ? K : never]: never;
                },
                factor: `${ISecondFactor}`,
              ],
            ]
          : never
        : never
    ) extends [
      [infer IFirstStart extends string, infer IFirstFactor extends string],
      [infer ISecondStart extends string, infer ISecondFactor extends string],
    ]
    ? (TTests extends any ? bigint.Add<IFirstStart, bigint.Mul<IFirstFactor, TTests>> : never) &
        (TTests extends any ? bigint.Add<ISecondStart, bigint.Mul<ISecondFactor, TTests>> : never)
    : never
  : never;

type FindHailWithoutSpeed<
  TInput extends string,
  USpeed extends string,
> = TInput extends `${infer IHail}\n${infer IRest}`
  ? IHail extends Hail<any, any, any, USpeed, USpeed, USpeed>
    ? FindHailWithoutSpeed<IRest, USpeed>
    : IHail
  : never;

type FindKnownStarts<
  TComponents extends { [_ in ComponentNames]: Component[] },
  TSpeeds extends { [_ in ComponentNames]: string },
> = {
  [K in ComponentNames]: TComponents[K][any] extends infer UComponent
    ? UComponent extends Component<infer IPos, TSpeeds[K]>
      ? IPos
      : never
    : never;
};

type HailComponents<THail extends Hail<any, any, any, any, any, any>> = THail extends Hail<
  infer IX,
  infer IY,
  infer IZ,
  infer IDX,
  infer IDY,
  infer IDZ
>
  ? { X: Component<IX, IDX>; Y: Component<IY, IDY>; Z: Component<IZ, IDZ> }
  : never;

type SolveForHail<
  THail extends Hail<any, any, any, any, any, any>,
  TSpeed extends { [_ in ComponentNames]: string },
  TKnownPos extends { [_ in ComponentNames]: string },
> = HailComponents<THail> extends infer IHailComponents extends { [_ in ComponentNames]: Component }
  ? {
      [K in ComponentNames]: [TKnownPos[K]] extends [never]
        ? never
        : bigint.Div<
            bigint.Sub<TKnownPos[K], ComponentPos<IHailComponents[K]>>,
            bigint.Sub<TSpeed[K], ComponentSpeed<IHailComponents[K]>>
          >[0];
    }[ComponentNames] extends infer ITime extends string
    ? {
        [K in ComponentNames]: bigint.Add<
          ComponentPos<IHailComponents[K]>,
          bigint.Mul<bigint.Sub<TSpeed[K], ComponentSpeed<IHailComponents[K]>>, ITime>
        >;
      }
    : never
  : never;

type Solve2<TInput extends string> = SliceInput<TInput> extends infer IComponents extends {
  [_ in ComponentNames]: Component[];
}
  ? utils.Expand<{
      [KName in ComponentNames]: FindSpeed<IComponents[KName]>;
    }> extends infer ISpeeds extends { [_ in ComponentNames]: string }
    ? union.Sum<
        SolveForHail<
          FindHailWithoutSpeed<Input, ISpeeds[ComponentNames]>,
          ISpeeds,
          FindKnownStarts<SliceInput<Input>, ISpeeds>
        >[ComponentNames]
      >
    : never
  : never;

// `yarn print sum 24 solution2`
export declare const solution2: Solve2<Input>;
