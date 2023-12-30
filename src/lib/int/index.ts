import { test } from '../test';
import type { Compare, CompareDigits } from './Compare';

export type { Compare } from './Compare';

type Bit = 0 | 1;
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

type DigitAddResult = [carry: Bit, result: Digit];

type MakeDigitAddResultRow<T extends DigitAddResult[]> = T['length'] extends 10
  ? T
  : MakeDigitAddResultRow<[...T, [0, T['length'] & Digit]]>;
type FirstDigitAddResultRow = MakeDigitAddResultRow<[]>;
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
type DigitAddMap = [
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

type TrimLeading0<T extends Digit[]> = T extends [0, ...infer IRest extends Digit[]]
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

export type Min<A extends number, B extends number> = Compare<A, B> extends 'lt' ? A : B;
export type Max<A extends number, B extends number> = Compare<A, B> extends 'gt' ? A : B;

declare const testMin: test.Describe<
  test.Expect<Min<5, 2>, 2>,
  test.Expect<Min<-5, -12345>, -12345>,
  test.Expect<Min<-1, 1>, -1>,
  test.Expect<Min<0, -1>, -1>,
  test.Expect<Min<0, 1>, 0>
>;

declare const testMax: test.Describe<
  test.Expect<Max<5, 2>, 5>,
  test.Expect<Max<-5, -12345>, -5>,
  test.Expect<Max<-1, 1>, 1>,
  test.Expect<Max<0, -1>, 0>,
  test.Expect<Max<0, 1>, 1>
>;

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

type MakeDigitwiseHalfMap<
  TCounter extends any[] = [],
  TResult extends DigitAddResult[] = [],
  TCarryResult extends DigitAddResult[] = [],
> = TCounter['length'] extends infer ICount extends Digit
  ? TResult['length'] extends Digit
    ? MakeDigitwiseHalfMap<[...TCounter, any], [...TResult, [0, ICount], [1, ICount]], TCarryResult>
    : MakeDigitwiseHalfMap<[...TCounter, any], TResult, [...TCarryResult, [0, ICount], [1, ICount]]>
  : [TResult, TCarryResult];

// [carry][dividend]
type DigitwiseHalfMap = MakeDigitwiseHalfMap;

type DigitwiseHalf<T extends Digit[], TCarry extends Bit = 0> = T extends [
  infer IHead extends Digit,
  ...infer IRest extends Digit[],
]
  ? DigitwiseHalfMap[TCarry][IHead] extends [infer ICarry extends Bit, infer IResult extends Digit]
    ? [IResult, ...DigitwiseHalf<IRest, ICarry>]
    : never
  : [];

export type Half<T extends number> = ToInteger<T> extends Integer<
  infer ISign extends Sign,
  infer IDigits extends Digit[]
>
  ? FromInteger<Integer<ISign, DigitwiseHalf<IDigits>>>
  : never;

declare const testHalf: test.Describe<
  test.Expect<Half<0>, 0>,
  test.Expect<Half<1>, 0>,
  test.Expect<Half<2>, 1>,
  test.Expect<Half<3>, 1>,
  test.Expect<Half<4>, 2>,
  test.Expect<Half<16>, 8>,
  test.Expect<Half<15>, 7>,
  test.Expect<Half<10000>, 5000>,
  test.Expect<Half<10100>, 5050>,
  test.Expect<Half<10099>, 5049>,
  test.Expect<Half<9999>, 4999>
>;

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
