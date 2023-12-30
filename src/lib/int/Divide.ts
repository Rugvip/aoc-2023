import { test } from '../test';
import { CompareDigits } from './Compare';
import {
  Digit,
  DigitwiseAdd,
  DigitwiseSubtract,
  Integer,
  ToInteger,
  FromInteger,
  TrimLeading0,
} from './index';

type CountFitDigits<
  TDividend extends Digit[],
  TDivisor extends Digit[],
  TAcc extends Digit[] = [],
  TResultCounter extends any[] = [],
> = DigitwiseAdd<TAcc, TDivisor> extends infer INext extends Digit[]
  ? CompareDigits<INext, TDividend> extends 'gt'
    ? [count: TResultCounter['length'], sum: TAcc]
    : CountFitDigits<TDividend, TDivisor, INext, [...TResultCounter, any]>
  : never;

declare const testCountFitDigits: test.Describe<
  test.Expect<CountFitDigits<[], [1]>, [count: 0, sum: []]>,
  test.Expect<CountFitDigits<[3], [1]>, [count: 3, sum: [3]]>,
  test.Expect<CountFitDigits<[3], [2]>, [count: 1, sum: [2]]>,
  test.Expect<CountFitDigits<[1, 6], [2]>, [count: 8, sum: [1, 6]]>,
  test.Expect<CountFitDigits<[1, 4], [1, 2]>, [count: 1, sum: [1, 2]]>,
  test.Expect<CountFitDigits<[6, 0], [7]>, [count: 8, sum: [5, 6]]>
>;

type DigitwiseDivide<
  TDividend extends Digit[],
  TDivisor extends Digit[],
  TResult extends Digit[] = [],
  TMem extends Digit[] = [],
> = TDividend extends [infer IHead extends Digit, ...infer IRest extends Digit[]]
  ? TrimLeading0<[...TMem, IHead]> extends infer INextMem extends Digit[]
    ? CountFitDigits<INextMem, TDivisor> extends [
        count: infer ICount extends Digit,
        sum: infer IFit extends Digit[],
      ]
      ? ICount extends 0
        ? DigitwiseDivide<IRest, TDivisor, [...TResult, 0], INextMem>
        : DigitwiseDivide<IRest, TDivisor, [...TResult, ICount], DigitwiseSubtract<INextMem, IFit>>
      : never
    : never
  : [result: TrimLeading0<TResult>, remainder: TrimLeading0<TMem>];

declare const testDigitwiseDivide: test.Describe<
  test.Expect<DigitwiseDivide<[0], [1]>, [result: [0], remainder: [0]]>,
  test.Expect<DigitwiseDivide<[1], [1]>, [result: [1], remainder: [0]]>,
  test.Expect<DigitwiseDivide<[4], [1]>, [result: [4], remainder: [0]]>,
  test.Expect<DigitwiseDivide<[6], [3]>, [result: [2], remainder: [0]]>,
  test.Expect<DigitwiseDivide<[8], [5]>, [result: [1], remainder: [3]]>,
  test.Expect<DigitwiseDivide<[1, 6], [2]>, [result: [8], remainder: [0]]>,
  test.Expect<DigitwiseDivide<[1, 5], [2]>, [result: [7], remainder: [1]]>,
  test.Expect<DigitwiseDivide<[1, 1], [2]>, [result: [5], remainder: [1]]>,
  test.Expect<DigitwiseDivide<[2, 3], [2]>, [result: [1, 1], remainder: [1]]>,
  test.Expect<DigitwiseDivide<[4, 5], [2]>, [result: [2, 2], remainder: [1]]>,
  test.Expect<DigitwiseDivide<[6, 7], [2]>, [result: [3, 3], remainder: [1]]>,
  test.Expect<DigitwiseDivide<[1, 6, 7], [2]>, [result: [8, 3], remainder: [1]]>,
  test.Expect<DigitwiseDivide<[1, 3, 6], [2]>, [result: [6, 8], remainder: [0]]>,
  test.Expect<DigitwiseDivide<[1, 3, 6, 7], [2]>, [result: [6, 8, 3], remainder: [1]]>,
  test.Expect<DigitwiseDivide<[1, 3, 6, 7, 6], [2]>, [result: [6, 8, 3, 8], remainder: [0]]>,
  test.Expect<DigitwiseDivide<[1, 0, 0], [1, 0]>, [result: [1, 0], remainder: [0]]>,
  test.Expect<DigitwiseDivide<[1, 0, 5], [1, 0]>, [result: [1, 0], remainder: [5]]>,
  test.Expect<DigitwiseDivide<[1, 2, 3, 4], [5, 6]>, [result: [2, 2], remainder: [2]]>
>;

export type Divide<TDividend extends number, TDivisor extends number> = TDivisor extends 0
  ? never
  : [ToInteger<TDividend>, ToInteger<TDivisor>] extends [
      infer IDividend extends Integer,
      infer IDivisor extends Integer,
    ]
  ? DigitwiseDivide<IDividend[1], IDivisor[1]> extends [
      result: infer IResult extends Digit[],
      remainder: infer IRemainder extends Digit[],
    ]
    ? [
        result: FromInteger<Integer<IDividend[0] extends IDivisor[0] ? '+' : '-', IResult>>,
        remainder: FromInteger<Integer<IDividend[0], IRemainder>>,
      ]
    : never
  : never;

declare const testDivide: test.Describe<
  test.Expect<Divide<0, 0>, never>,
  test.Expect<Divide<0, 1>, [result: 0, remainder: 0]>,
  test.Expect<Divide<0, 123>, [result: 0, remainder: 0]>,
  test.Expect<Divide<1, 1>, [result: 1, remainder: 0]>,
  test.Expect<Divide<1, 2>, [result: 0, remainder: 1]>,
  test.Expect<Divide<2, 1>, [result: 2, remainder: 0]>,
  test.Expect<Divide<8, 5>, [result: 1, remainder: 3]>,
  test.Expect<Divide<16, 2>, [result: 8, remainder: 0]>,
  test.Expect<Divide<15, 2>, [result: 7, remainder: 1]>,
  test.Expect<Divide<13676, 2>, [result: 6838, remainder: 0]>,
  test.Expect<Divide<1, -1>, [result: -1, remainder: 0]>,
  test.Expect<Divide<-1, 1>, [result: -1, remainder: 0]>,
  test.Expect<Divide<-1, -1>, [result: 1, remainder: 0]>,
  test.Expect<Divide<-100, -10>, [result: 10, remainder: 0]>,
  test.Expect<Divide<-105, -10>, [result: 10, remainder: -5]>
>;
