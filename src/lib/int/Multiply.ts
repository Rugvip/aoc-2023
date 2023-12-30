import * as test from '../test';
import { Bit, Digit, ToInteger, Integer, FromInteger } from './types';
import { DigitwiseAdd, DigitAddMap } from './Add';

type DigitMultiplyResult = [carry: Digit, result: Digit];

type CounterToDigitMultiplyResult<T extends any[]> =
  `${T['length']}` extends `${infer ICarry extends Digit}${infer IResult extends Digit}`
    ? [ICarry, IResult]
    : [0, T['length'] & Digit];

type MultiplyCounters<TA extends any[], TB extends any[], TResult extends any[] = []> = TA extends [
  any,
  ...infer IARest extends any[],
]
  ? MultiplyCounters<IARest, TB, [...TResult, ...TB]>
  : TResult;

type MakeDigitMultiplyRow<
  TA extends any[],
  TB extends any[] = [],
  TResult extends DigitMultiplyResult[] = [],
> = TB['length'] extends 10
  ? TResult
  : MakeDigitMultiplyRow<
      TA,
      [...TB, any],
      [...TResult, CounterToDigitMultiplyResult<MultiplyCounters<TA, TB>>]
    >;

type MakeDigitMultiplyMap<
  TA extends any[],
  TResult extends DigitMultiplyResult[][] = [],
> = TA['length'] extends 10
  ? TResult
  : MakeDigitMultiplyMap<[...TA, any], [...TResult, MakeDigitMultiplyRow<TA>]>;

type DigitMultiplyMap = MakeDigitMultiplyMap<[]>;

declare const testDigitMultiplyMap: test.Describe<
  test.Expect<DigitMultiplyMap[0][0], [0, 0]>,
  test.Expect<DigitMultiplyMap[0][1], [0, 0]>,
  test.Expect<DigitMultiplyMap[1][1], [0, 1]>,
  test.Expect<DigitMultiplyMap[1][0], [0, 0]>,
  test.Expect<DigitMultiplyMap[0][2], [0, 0]>,
  test.Expect<DigitMultiplyMap[2][0], [0, 0]>,
  test.Expect<DigitMultiplyMap[2][1], [0, 2]>,
  test.Expect<DigitMultiplyMap[1][2], [0, 2]>,
  test.Expect<DigitMultiplyMap[3][2], [0, 6]>,
  test.Expect<DigitMultiplyMap[3][4], [1, 2]>,
  test.Expect<DigitMultiplyMap[7][8], [5, 6]>,
  test.Expect<DigitMultiplyMap[9][9], [8, 1]>
>;

type DigitwiseMultiplyOne<
  TA extends Digit,
  TB extends Digit[],
  TC extends Digit = 0,
  TResult extends Digit[] = [],
> = TB extends [...infer IBRest extends Digit[], infer IB0 extends Digit]
  ? DigitMultiplyMap[TA][IB0] extends [infer IC extends Digit, infer IR extends Digit]
    ? DigitAddMap[0][IR][TC] extends [infer IC2 extends Bit, infer IR2 extends Digit]
      ? DigitwiseMultiplyOne<TA, IBRest, DigitAddMap[IC2][IC][0][1], [IR2, ...TResult]>
      : never
    : never
  : TC extends 0
  ? TResult
  : [TC, ...TResult];

type DigitwiseMultiply<
  TA extends Digit[],
  TB extends Digit[],
  TPad extends 0[] = [],
  TResult extends Digit[] = [0],
> = TA extends [...infer IARest extends Digit[], infer IA0 extends Digit]
  ? DigitwiseMultiply<
      IARest,
      TB,
      [...TPad, 0],
      DigitwiseAdd<TResult, DigitwiseMultiplyOne<IA0, [...TB, ...TPad]>>
    >
  : TResult;

export type Multiply<
  TA extends number | string,
  TB extends number | string,
> = ToInteger<TA> extends infer IA extends Integer
  ? ToInteger<TB> extends infer IB extends Integer
    ? FromInteger<Integer<IA[0] extends IB[0] ? '+' : '-', DigitwiseMultiply<IA[1], IB[1]>>>
    : never
  : never;

declare const testMultiply: test.Describe<
  test.Expect<Multiply<0, 0>, 0>,
  test.Expect<Multiply<1, 1>, 1>,
  test.Expect<Multiply<10, 0>, 0>,
  test.Expect<Multiply<0, 10>, 0>,
  test.Expect<Multiply<99, 99>, 9801>,
  test.Expect<Multiply<-99, 99>, -9801>,
  test.Expect<Multiply<99, -99>, -9801>,
  test.Expect<Multiply<-99, -99>, 9801>,
  test.Expect<Multiply<123, 2>, 246>
>;
