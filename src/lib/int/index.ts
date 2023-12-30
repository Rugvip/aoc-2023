import { test } from '../test';
import { Add, AddIntegers } from './Add';

export type { Compare, Min, Max } from './Compare';
export type { Divide } from './Divide';
export type { Multiply } from './Multiply';
export type { Subtract } from './Subtract';
export type { Add } from './Add';

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
