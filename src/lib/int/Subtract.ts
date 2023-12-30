import { test } from '../test';
import { Bit, Digit, ToInteger, Integer, FromInteger } from './index';
import { AddIntegers, DigitAddResult, FirstDigitAddResultRow } from './Add';

type RotateDigitAddResultRowRight<T extends DigitAddResult[]> = T extends [
  ...infer IRest extends DigitAddResult[],
  [0, infer IResult extends Digit],
]
  ? [[1, IResult], ...IRest]
  : never;
type MakeDigitSubtractMap<
  T extends DigitAddResult[],
  TResult extends DigitAddResult[][] = [],
> = TResult['length'] extends 10
  ? TResult
  : MakeDigitSubtractMap<RotateDigitAddResultRowRight<T>, [...TResult, T]>;

// [borrow][subtrahend][minuend]
type DigitSubtractMap = [
  MakeDigitSubtractMap<FirstDigitAddResultRow>,
  MakeDigitSubtractMap<RotateDigitAddResultRowRight<FirstDigitAddResultRow>>,
];

declare const testDigitSubtractMap: test.Describe<
  test.Expect<DigitSubtractMap[0][0][0], [0, 0]>,
  test.Expect<DigitSubtractMap[0][0][1], [0, 1]>,
  test.Expect<DigitSubtractMap[0][1][0], [1, 9]>,
  test.Expect<DigitSubtractMap[1][0][0], [1, 9]>,
  test.Expect<DigitSubtractMap[0][1][1], [0, 0]>,
  test.Expect<DigitSubtractMap[1][1][0], [1, 8]>,
  test.Expect<DigitSubtractMap[1][0][1], [0, 0]>,
  test.Expect<DigitSubtractMap[0][0][9], [0, 9]>,
  test.Expect<DigitSubtractMap[0][9][0], [1, 1]>,
  test.Expect<DigitSubtractMap[1][0][9], [0, 8]>,
  test.Expect<DigitSubtractMap[1][9][0], [1, 0]>,
  test.Expect<DigitSubtractMap[0][9][9], [0, 0]>,
  test.Expect<DigitSubtractMap[1][9][9], [1, 9]>
>;

export type DigitwiseSubtract<
  TA extends Digit[],
  TB extends Digit[],
  TC extends Bit = 0,
  TResult extends Digit[] = [],
> = TA extends [...infer IARest extends Digit[], infer IA0 extends Digit]
  ? TB extends [...infer IBRest extends Digit[], infer IB0 extends Digit]
    ? DigitSubtractMap[TC][IB0][IA0] extends [infer IC extends Bit, infer IR extends Digit]
      ? DigitwiseSubtract<IARest, IBRest, IC, [IR, ...TResult]>
      : never
    : DigitSubtractMap[TC][0][IA0] extends [infer IC extends Bit, infer IR extends Digit]
    ? DigitwiseSubtract<IARest, [], IC, [IR, ...TResult]>
    : never
  : TB extends [...infer IBRest extends Digit[], infer IB0 extends Digit]
  ? DigitSubtractMap[0][IB0][TC] extends [infer IC extends Bit, infer IR extends Digit]
    ? DigitwiseSubtract<[], IBRest, IC, [IR, ...TResult]>
    : never
  : TC extends 1
  ? never // subtraction should always be aligned to not result in a borrow
  : TResult;

declare const testSubtractDigits: test.Describe<
  test.Expect<DigitwiseSubtract<[], []>, []>,
  test.Expect<DigitwiseSubtract<[], [0]>, [0]>,
  test.Expect<DigitwiseSubtract<[0], []>, [0]>,
  test.Expect<DigitwiseSubtract<[1], []>, [1]>,
  test.Expect<DigitwiseSubtract<[], [1]>, never>,
  test.Expect<DigitwiseSubtract<[1], [1]>, [0]>,
  test.Expect<DigitwiseSubtract<[1, 0, 1], [1, 0]>, [0, 9, 1]>,
  test.Expect<DigitwiseSubtract<[1, 0, 0], [9, 9]>, [0, 0, 1]>
>;

export type Subtract<
  TA extends number | string,
  TB extends number | string,
> = ToInteger<TA> extends infer IA extends Integer
  ? ToInteger<TB> extends infer IB extends Integer
    ? FromInteger<AddIntegers<IA, Integer<IB[0] extends '+' ? '-' : '+', IB[1]>>>
    : never
  : never;

declare const testSubtract: test.Describe<
  test.Expect<Subtract<0, 0>, 0>,
  test.Expect<Subtract<0, 1>, -1>,
  test.Expect<Subtract<1, 0>, 1>,
  test.Expect<Subtract<1, 1>, 0>,
  test.Expect<Subtract<-1, 1>, -2>,
  test.Expect<Subtract<1, -1>, 2>,
  test.Expect<Subtract<-1, -1>, 0>,
  test.Expect<Subtract<0, 100>, -100>,
  test.Expect<Subtract<200, 100>, 100>,
  test.Expect<Subtract<1000, 200>, 800>,
  test.Expect<Subtract<123, 456>, -333>,
  test.Expect<Subtract<123, -456>, 579>,
  test.Expect<Subtract<123, -123>, 246>,
  test.Expect<Subtract<101, 10>, 91>,
  test.Expect<Subtract<100, 99>, 1>
>;
