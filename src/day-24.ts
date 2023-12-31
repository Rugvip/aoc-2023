import { Input } from '../input/24';
import { counter, bigint, strings } from './lib';

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
