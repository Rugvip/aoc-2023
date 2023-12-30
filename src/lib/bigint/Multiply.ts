import { test } from '../test';
import { Bit, Digit } from './types';
import { DigitAddMap, DigitwiseStrAdd } from './Add';
import { TrimZeroes } from './utils';

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

type DigitwiseStrMultiplyOne<
  TA extends Digit,
  TB extends string,
  TC extends Digit = 0,
  TResult extends string = '',
> = TB extends `${infer IBRest}${Digit}`
  ? TB extends `${IBRest}${infer IB0 extends Digit}`
    ? DigitMultiplyMap[TA][IB0] extends [infer IC extends Digit, infer IR extends Digit]
      ? DigitAddMap[0][IR][TC] extends [infer IC2 extends Bit, infer IR2 extends Digit]
        ? DigitwiseStrMultiplyOne<TA, IBRest, DigitAddMap[IC2][IC][0][1], `${IR2}${TResult}`>
        : never
      : never
    : never
  : TC extends 0
  ? TResult
  : `${TC}${TResult}`;

type DigitwiseStrMultiply<
  TA extends string,
  TB extends string,
  TPad extends string = '',
  TResult extends string = '0',
> = TA extends `${infer IARest}${Digit}`
  ? TA extends `${IARest}${infer IA0 extends Digit}`
    ? DigitwiseStrMultiply<
        IARest,
        TB,
        `${TPad}0`,
        DigitwiseStrAdd<TResult, DigitwiseStrMultiplyOne<IA0, `${TB}${TPad}`>>
      >
    : never
  : TrimZeroes<TResult>;

export type Multiply<
  TA extends number | string,
  TB extends number | string,
> = `${TA}` extends `-${infer NA}`
  ? `${TB}` extends `-${infer NB}`
    ? DigitwiseStrMultiply<NA, NB>
    : `-${DigitwiseStrMultiply<NA, `${TB}`>}`
  : `${TB}` extends `-${infer NB}`
  ? `-${DigitwiseStrMultiply<`${TA}`, NB>}`
  : DigitwiseStrMultiply<`${TA}`, `${TB}`>;

declare const testMultiply: test.Describe<
  test.Expect<Multiply<0, 0>, '0'>,
  test.Expect<Multiply<1, 1>, '1'>,
  test.Expect<Multiply<10, 0>, '0'>,
  test.Expect<Multiply<0, 10>, '0'>,
  test.Expect<Multiply<99, 99>, '9801'>,
  test.Expect<Multiply<-99, 99>, '-9801'>,
  test.Expect<Multiply<99, -99>, '-9801'>,
  test.Expect<Multiply<-99, -99>, '9801'>,
  test.Expect<Multiply<123, 2>, '246'>
>;
