import { test } from '../test';
import type { CompareDigits } from './Compare';
import type { DigitwiseSubtract } from './Subtract';

export type { Compare, Min, Max } from './Compare';
export type { Divide } from './Divide';
export type { Multiply } from './Multiply';
export type { Subtract } from './Subtract';

export type Bit = 0 | 1;
export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Sign = '+' | '-';

export type FlipSign<T extends number> = T extends 0
  ? 0
  : `${T}` extends `-${infer N extends number}`
  ? N
  : `-${T}` extends `${infer N extends number}`
  ? N
  : never;

export type IsNegative<T extends number> = `${T}` extends `-${string}` ? true : false;

export type Abs<T extends number> = `${T}` extends `-${infer N extends number}` ? N : T;

declare const testAbs: test.Describe<
  test.Expect<Abs<0>, 0>,
  test.Expect<Abs<-1>, 1>,
  test.Expect<Abs<1>, 1>,
  test.Expect<Abs<-99>, 99>,
  test.Expect<Abs<99>, 99>
>;

export type Integer<TSign extends Sign = Sign, TDigits extends Digit[] = Digit[]> = [
  sign: TSign,
  digits: TDigits,
];

export type DigitAddResult = [carry: Bit, result: Digit];

type MakeDigitAddResultRow<T extends DigitAddResult[]> = T['length'] extends 10
  ? T
  : MakeDigitAddResultRow<[...T, [0, T['length'] & Digit]]>;
export type FirstDigitAddResultRow = MakeDigitAddResultRow<[]>;
type RotateDigitAddResultRowLeft<T extends DigitAddResult[]> = T extends [
  [0, infer IResult extends Digit],
  ...infer IRest extends DigitAddResult[],
]
  ? [...IRest, [1, IResult]]
  : never;
type MakeDigitAddMap<
  T extends DigitAddResult[],
  TResult extends DigitAddResult[][] = [],
> = TResult['length'] extends 10
  ? TResult
  : MakeDigitAddMap<RotateDigitAddResultRowLeft<T>, [...TResult, T]>;

// [carry][digit][digit]
export type DigitAddMap = [
  MakeDigitAddMap<FirstDigitAddResultRow>,
  MakeDigitAddMap<RotateDigitAddResultRowLeft<FirstDigitAddResultRow>>,
];

declare const testDigitAddMap: test.Describe<
  test.Expect<DigitAddMap[0][0][0], [0, 0]>,
  test.Expect<DigitAddMap[0][1][0], [0, 1]>,
  test.Expect<DigitAddMap[0][0][1], [0, 1]>,
  test.Expect<DigitAddMap[1][0][0], [0, 1]>,
  test.Expect<DigitAddMap[0][1][1], [0, 2]>,
  test.Expect<DigitAddMap[1][0][1], [0, 2]>,
  test.Expect<DigitAddMap[1][1][0], [0, 2]>,
  test.Expect<DigitAddMap[0][9][0], [0, 9]>,
  test.Expect<DigitAddMap[0][0][9], [0, 9]>,
  test.Expect<DigitAddMap[1][9][0], [1, 0]>,
  test.Expect<DigitAddMap[1][0][9], [1, 0]>,
  test.Expect<DigitAddMap[0][9][9], [1, 8]>,
  test.Expect<DigitAddMap[1][9][9], [1, 9]>
>;

export type DigitwiseAdd<
  TA extends Digit[],
  TB extends Digit[],
  TC extends Bit = 0,
  TResult extends Digit[] = [],
> = TA extends [...infer IARest extends Digit[], infer IA0 extends Digit]
  ? TB extends [...infer IBRest extends Digit[], infer IB0 extends Digit]
    ? DigitAddMap[TC][IA0][IB0] extends [infer IC extends Bit, infer IR extends Digit]
      ? DigitwiseAdd<IARest, IBRest, IC, [IR, ...TResult]>
      : never
    : DigitAddMap[TC][IA0][0] extends [infer IC extends Bit, infer IR extends Digit]
    ? DigitwiseAdd<IARest, [], IC, [IR, ...TResult]>
    : never
  : TB extends [...infer IBRest extends Digit[], infer IB0 extends Digit]
  ? DigitAddMap[TC][0][IB0] extends [infer IC extends Bit, infer IR extends Digit]
    ? DigitwiseAdd<[], IBRest, IC, [IR, ...TResult]>
    : never
  : TC extends 1
  ? [TC, ...TResult]
  : TResult;

declare const testDigitwiseAdd: test.Describe<
  test.Expect<DigitwiseAdd<[], []>, []>,
  test.Expect<DigitwiseAdd<[], [0]>, [0]>,
  test.Expect<DigitwiseAdd<[0], []>, [0]>,
  test.Expect<DigitwiseAdd<[1], []>, [1]>,
  test.Expect<DigitwiseAdd<[], [1]>, [1]>,
  test.Expect<DigitwiseAdd<[1], [1]>, [2]>,
  test.Expect<DigitwiseAdd<[1, 0], [1, 0, 1]>, [1, 1, 1]>,
  test.Expect<DigitwiseAdd<[0, 1, 0], [1, 1, 1]>, [1, 2, 1]>
>;

type StrToDigits<S extends string> = S extends `${infer IChar extends Digit}${infer IRest}`
  ? [IChar, ...StrToDigits<IRest>]
  : [];

export type TrimLeading0<T extends Digit[]> = T extends [0, ...infer IRest extends Digit[]]
  ? TrimLeading0<IRest>
  : T extends []
  ? [0]
  : T;

export type ToInteger<T extends number | string> = `${T}` extends `-${infer I}`
  ? Integer<'-', StrToDigits<I>>
  : Integer<'+', TrimLeading0<StrToDigits<`${T}`>>>;

declare const testToInteger: test.Describe<
  test.Expect<ToInteger<'0'>, Integer<'+', [0]>>,
  test.Expect<ToInteger<'1'>, Integer<'+', [1]>>,
  test.Expect<ToInteger<'01'>, Integer<'+', [1]>>,
  test.Expect<ToInteger<'123'>, Integer<'+', [1, 2, 3]>>,
  test.Expect<ToInteger<'-0'>, Integer<'-', [0]>>,
  test.Expect<ToInteger<'-1'>, Integer<'-', [1]>>,
  test.Expect<ToInteger<'-123'>, Integer<'-', [1, 2, 3]>>,
  test.Expect<ToInteger<0>, Integer<'+', [0]>>,
  test.Expect<ToInteger<1>, Integer<'+', [1]>>,
  test.Expect<ToInteger<123>, Integer<'+', [1, 2, 3]>>,
  test.Expect<ToInteger<-1>, Integer<'-', [1]>>,
  test.Expect<ToInteger<-123>, Integer<'-', [1, 2, 3]>>
>;

type DigitsToStr<T extends Digit[]> = T extends [
  infer IChar extends Digit,
  ...infer IRest extends Digit[],
]
  ? `${IChar}${DigitsToStr<IRest>}`
  : '';

export type FromInteger<T extends Integer> = T[1] extends [0]
  ? 0
  : `${T[0] extends '-' ? '-' : ''}${DigitsToStr<
      TrimLeading0<T[1]>
    >}` extends `${infer N extends number}`
  ? N
  : never;

declare const testFromInteger: test.Describe<
  test.Expect<FromInteger<Integer<'+', [0]>>, 0>,
  test.Expect<FromInteger<Integer<'+', [1]>>, 1>,
  test.Expect<FromInteger<Integer<'+', [1, 2, 3]>>, 123>,
  test.Expect<FromInteger<Integer<'-', [0]>>, 0>,
  test.Expect<FromInteger<Integer<'-', [1]>>, -1>,
  test.Expect<FromInteger<Integer<'-', [1, 2, 3]>>, -123>
>;

export type AddIntegers<TA extends Integer, TB extends Integer> = {
  '+': {
    '+': Integer<'+', DigitwiseAdd<TA[1], TB[1]>>;
    '-': {
      lt: Integer<'-', DigitwiseSubtract<TB[1], TA[1]>>;
      eq: Integer<'+', [0]>;
      gt: Integer<'+', DigitwiseSubtract<TA[1], TB[1]>>;
    }[CompareDigits<TA[1], TB[1]>];
  };
  '-': {
    '+': {
      lt: Integer<'+', DigitwiseSubtract<TB[1], TA[1]>>;
      eq: Integer<'+', [0]>;
      gt: Integer<'-', DigitwiseSubtract<TA[1], TB[1]>>;
    }[CompareDigits<TA[1], TB[1]>];
    '-': Integer<'-', DigitwiseAdd<TA[1], TB[1]>>;
  };
}[TA[0]][TB[0]];

export type Add<
  TA extends number | string,
  TB extends number | string,
> = ToInteger<TA> extends infer IA extends Integer
  ? ToInteger<TB> extends infer IB extends Integer
    ? FromInteger<AddIntegers<IA, IB>>
    : never
  : never;

declare const testAdd: test.Describe<
  test.Expect<Add<0, 0>, 0>,
  test.Expect<Add<1, 1>, 2>,
  test.Expect<Add<0, 1>, 1>,
  test.Expect<Add<1, 0>, 1>,
  test.Expect<Add<12, 23>, 35>,
  test.Expect<Add<875, 125>, 1000>,
  test.Expect<Add<123, 123>, 246>,
  test.Expect<Add<'123', 123>, 246>,
  test.Expect<Add<123, '123'>, 246>,
  test.Expect<Add<'123', '123'>, 246>,
  test.Expect<Add<123, -123>, 0>,
  test.Expect<Add<-123, -123>, -246>,
  test.Expect<Add<-123, 0>, -123>,
  test.Expect<Add<0, -123>, -123>,
  test.Expect<Add<123, 123>, 246>
>;

export type Sum<TN extends number[]> = TN extends [
  infer IHead extends number,
  ...infer IRest extends number[],
]
  ? Add<IHead, Sum<IRest>>
  : 0;

declare const testSum: test.Describe<
  test.Expect<Sum<[]>, 0>,
  test.Expect<Sum<[0]>, 0>,
  test.Expect<Sum<[0, 0]>, 0>,
  test.Expect<Sum<[1]>, 1>,
  test.Expect<Sum<[99]>, 99>,
  test.Expect<Sum<[1, 1, 1, 1, 1, 1]>, 6>,
  test.Expect<Sum<[-1, 1]>, 0>
>;

export type Inc<TA extends number | string> = ToInteger<TA> extends infer IA extends Integer
  ? FromInteger<AddIntegers<IA, Integer<'+', [1]>>>
  : never;

declare const testInc: test.Describe<
  test.Expect<Inc<0>, 1>,
  test.Expect<Inc<-1>, 0>,
  test.Expect<Inc<1>, 2>,
  test.Expect<Inc<999999>, 1000000>
>;

export type Dec<TA extends number | string> = ToInteger<TA> extends infer IA extends Integer
  ? FromInteger<AddIntegers<IA, Integer<'-', [1]>>>
  : never;

declare const testDec: test.Describe<
  test.Expect<Dec<0>, -1>,
  test.Expect<Dec<-1>, -2>,
  test.Expect<Dec<1>, 0>,
  test.Expect<Dec<1000000>, 999999>
>;
