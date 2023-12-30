import * as test from '../test';
import { Bit, Digit } from './types';
import { PositiveSub } from './Sub';
import { Compare } from './Compare';

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

export type PositiveAdd<
  TA extends string,
  TB extends string,
  TC extends Bit = 0,
  TResult extends string = '',
> = TA extends `${infer IARest}${Digit}`
  ? TA extends `${IARest}${infer IA0 extends Digit}`
    ? TB extends `${infer IBRest}${Digit}`
      ? TB extends `${IBRest}${infer IB0 extends Digit}`
        ? PositiveAdd<
            IARest,
            IBRest,
            DigitAddMap[TC][IA0][IB0][0],
            `${DigitAddMap[TC][IA0][IB0][1]}${TResult}`
          >
        : never
      : PositiveAdd<
          IARest,
          '',
          DigitAddMap[TC][IA0][0][0],
          `${DigitAddMap[TC][IA0][0][1]}${TResult}`
        >
    : never
  : TB extends `${infer IBRest}${Digit}`
  ? TB extends `${IBRest}${infer IB0 extends Digit}`
    ? PositiveAdd<'', IBRest, DigitAddMap[TC][0][IB0][0], `${DigitAddMap[TC][0][IB0][1]}${TResult}`>
    : never
  : TC extends 1
  ? `${TC}${TResult}`
  : TResult;

declare const testPositiveAdd: test.Describe<
  test.Expect<PositiveAdd<'', ''>, ''>,
  test.Expect<PositiveAdd<'', '0'>, '0'>,
  test.Expect<PositiveAdd<'0', ''>, '0'>,
  test.Expect<PositiveAdd<'1', ''>, '1'>,
  test.Expect<PositiveAdd<'', '1'>, '1'>,
  test.Expect<PositiveAdd<'1', '1'>, '2'>,
  test.Expect<PositiveAdd<'10', '101'>, '111'>,
  test.Expect<PositiveAdd<'010', '111'>, '121'>,
  test.Expect<PositiveAdd<'875', '125'>, '1000'>
>;

export type Add<
  TA extends number | string,
  TB extends number | string,
> = `${TA}` extends `-${infer NA}`
  ? `${TB}` extends `-${infer NB}`
    ? `-${PositiveAdd<NA, NB>}`
    : {
        lt: PositiveSub<`${TB}`, NA>;
        eq: '0';
        gt: `-${PositiveSub<NA, `${TB}`>}`;
      }[Compare<NA, TB>]
  : `${TB}` extends `-${infer NB}`
  ? {
      lt: `-${PositiveSub<NB, `${TA}`>}`;
      eq: '0';
      gt: PositiveSub<`${TA}`, NB>;
    }[Compare<TA, NB>]
  : PositiveAdd<`${TA}`, `${TB}`>;

declare const testAdd: test.Describe<
  test.Expect<Add<0, 0>, '0'>,
  test.Expect<Add<1, 1>, '2'>,
  test.Expect<Add<0, 1>, '1'>,
  test.Expect<Add<1, 0>, '1'>,
  test.Expect<Add<12, 23>, '35'>,
  test.Expect<Add<875, 125>, '1000'>,
  test.Expect<Add<123, 123>, '246'>,
  test.Expect<Add<'123', 123>, '246'>,
  test.Expect<Add<123, '123'>, '246'>,
  test.Expect<Add<'123', '123'>, '246'>,
  test.Expect<Add<123, -123>, '0'>,
  test.Expect<Add<-123, -123>, '-246'>,
  test.Expect<Add<-123, 0>, '-123'>,
  test.Expect<Add<0, -123>, '-123'>,
  test.Expect<Add<123, 123>, '246'>
>;
