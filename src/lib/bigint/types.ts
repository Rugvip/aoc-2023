import { test } from '../test';

export type Bit = 0 | 1;
export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Sign = '+' | '-';

export type Integer<TSign extends Sign = Sign, TDigits extends Digit[] = Digit[]> = [
  sign: TSign,
  digits: TDigits,
];

export type StrToDigits<S extends string> = S extends `${infer IChar extends Digit}${infer IRest}`
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

export type DigitsToStr<T extends Digit[]> = T extends [
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
