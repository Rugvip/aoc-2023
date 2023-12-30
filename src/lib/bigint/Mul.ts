import * as test from '../test';
import { Digit } from './types';
import { DigitAddMap, PositiveAdd } from './Add';
import { TrimZeroes } from './utils';

type DigitMulResult = [carry: Digit, result: Digit];

type CounterToDigitMulResult<T extends any[]> =
  `${T['length']}` extends `${infer ICarry extends Digit}${infer IResult extends Digit}`
    ? [ICarry, IResult]
    : [0, T['length'] & Digit];

type MulCounters<TA extends any[], TB extends any[], TResult extends any[] = []> = TA extends [
  any,
  ...infer IARest extends any[],
]
  ? MulCounters<IARest, TB, [...TResult, ...TB]>
  : TResult;

type MakeDigitMulRow<
  TA extends any[],
  TB extends any[] = [],
  TResult extends DigitMulResult[] = [],
> = TB['length'] extends 10
  ? TResult
  : MakeDigitMulRow<TA, [...TB, any], [...TResult, CounterToDigitMulResult<MulCounters<TA, TB>>]>;

type MakeDigitMulMap<
  TA extends any[],
  TResult extends DigitMulResult[][] = [],
> = TA['length'] extends 10
  ? TResult
  : MakeDigitMulMap<[...TA, any], [...TResult, MakeDigitMulRow<TA>]>;

type DigitMulMap = MakeDigitMulMap<[]>;

declare const testDigitMulMap: test.Describe<
  test.Expect<DigitMulMap[0][0], [0, 0]>,
  test.Expect<DigitMulMap[0][1], [0, 0]>,
  test.Expect<DigitMulMap[1][1], [0, 1]>,
  test.Expect<DigitMulMap[1][0], [0, 0]>,
  test.Expect<DigitMulMap[0][2], [0, 0]>,
  test.Expect<DigitMulMap[2][0], [0, 0]>,
  test.Expect<DigitMulMap[2][1], [0, 2]>,
  test.Expect<DigitMulMap[1][2], [0, 2]>,
  test.Expect<DigitMulMap[3][2], [0, 6]>,
  test.Expect<DigitMulMap[3][4], [1, 2]>,
  test.Expect<DigitMulMap[7][8], [5, 6]>,
  test.Expect<DigitMulMap[9][9], [8, 1]>
>;

type PositiveMulOne<
  TA extends Digit,
  TB extends string,
  TC extends Digit = 0,
  TResult extends string = '',
> = TB extends `${infer IBRest}${Digit}`
  ? TB extends `${IBRest}${infer IB0 extends Digit}`
    ? DigitMulMap[TA][IB0] extends [infer IC extends Digit, infer IR extends Digit]
      ? PositiveMulOne<
          TA,
          IBRest,
          DigitAddMap[DigitAddMap[0][IR][TC][0]][IC][0][1],
          `${DigitAddMap[0][IR][TC][1]}${TResult}`
        >
      : never
    : never
  : TC extends 0
  ? TResult
  : `${TC}${TResult}`;

type PositiveMul<
  TA extends string,
  TB extends string,
  TPad extends string = '',
  TResult extends string = '0',
> = TA extends `${infer IARest}${Digit}`
  ? TA extends `${IARest}${infer IA0 extends Digit}`
    ? PositiveMul<IARest, TB, `${TPad}0`, PositiveAdd<TResult, PositiveMulOne<IA0, `${TB}${TPad}`>>>
    : never
  : TrimZeroes<TResult>;

export type Mul<
  TA extends number | string,
  TB extends number | string,
> = `${TA}` extends `-${infer NA}`
  ? `${TB}` extends `-${infer NB}`
    ? PositiveMul<NA, NB>
    : `-${PositiveMul<NA, `${TB}`>}`
  : `${TB}` extends `-${infer NB}`
  ? `-${PositiveMul<`${TA}`, NB>}`
  : PositiveMul<`${TA}`, `${TB}`>;

declare const testMul: test.Describe<
  test.Expect<Mul<0, 0>, '0'>,
  test.Expect<Mul<1, 1>, '1'>,
  test.Expect<Mul<10, 0>, '0'>,
  test.Expect<Mul<0, 10>, '0'>,
  test.Expect<Mul<99, 99>, '9801'>,
  test.Expect<Mul<-99, 99>, '-9801'>,
  test.Expect<Mul<99, -99>, '-9801'>,
  test.Expect<Mul<-99, -99>, '9801'>,
  test.Expect<Mul<123, 2>, '246'>
>;
