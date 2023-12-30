import * as test from '../test';
import { Bit, Digit } from './types';
import { TrimZeroes } from './utils';
import { Compare } from './Compare';
import { PositiveAdd, DigitAddResult, FirstDigitAddResultRow } from './Add';

type RotateDigitAddResultRowRight<T extends DigitAddResult[]> = T extends [
  ...infer IRest extends DigitAddResult[],
  [0, infer IResult extends Digit],
]
  ? [[1, IResult], ...IRest]
  : never;
type MakeDigitSubMap<
  T extends DigitAddResult[],
  TResult extends DigitAddResult[][] = [],
> = TResult['length'] extends 10
  ? TResult
  : MakeDigitSubMap<RotateDigitAddResultRowRight<T>, [...TResult, T]>;

// [borrow][subtrahend][minuend]
type DigitSubMap = [
  MakeDigitSubMap<FirstDigitAddResultRow>,
  MakeDigitSubMap<RotateDigitAddResultRowRight<FirstDigitAddResultRow>>,
];

declare const testDigitSubMap: test.Describe<
  test.Expect<DigitSubMap[0][0][0], [0, 0]>,
  test.Expect<DigitSubMap[0][0][1], [0, 1]>,
  test.Expect<DigitSubMap[0][1][0], [1, 9]>,
  test.Expect<DigitSubMap[1][0][0], [1, 9]>,
  test.Expect<DigitSubMap[0][1][1], [0, 0]>,
  test.Expect<DigitSubMap[1][1][0], [1, 8]>,
  test.Expect<DigitSubMap[1][0][1], [0, 0]>,
  test.Expect<DigitSubMap[0][0][9], [0, 9]>,
  test.Expect<DigitSubMap[0][9][0], [1, 1]>,
  test.Expect<DigitSubMap[1][0][9], [0, 8]>,
  test.Expect<DigitSubMap[1][9][0], [1, 0]>,
  test.Expect<DigitSubMap[0][9][9], [0, 0]>,
  test.Expect<DigitSubMap[1][9][9], [1, 9]>
>;

export type PositiveSub<
  TA extends string,
  TB extends string,
  TC extends Bit = 0,
  TResult extends string = '',
> = TA extends `${infer IARest}${Digit}`
  ? TA extends `${IARest}${infer IA0 extends Digit}`
    ? TB extends `${infer IBRest}${Digit}`
      ? TB extends `${IBRest}${infer IB0 extends Digit}`
        ? PositiveSub<
            IARest,
            IBRest,
            DigitSubMap[TC][IB0][IA0][0],
            `${DigitSubMap[TC][IB0][IA0][1]}${TResult}`
          >
        : never
      : PositiveSub<
          IARest,
          '',
          DigitSubMap[TC][0][IA0][0],
          `${DigitSubMap[TC][0][IA0][1]}${TResult}`
        >
    : never
  : TB extends `${infer IBRest}${Digit}`
  ? TB extends `${IBRest}${infer IB0 extends Digit}`
    ? PositiveSub<'', IBRest, DigitSubMap[0][IB0][TC][0], `${DigitSubMap[0][IB0][TC][1]}${TResult}`>
    : never
  : TC extends 1
  ? never // subtraction should always be aligned to not result in a borrow
  : TrimZeroes<TResult>;

declare const testPositiveSub: test.Describe<
  test.Expect<PositiveSub<'', ''>, ''>,
  test.Expect<PositiveSub<'', '0'>, '0'>,
  test.Expect<PositiveSub<'0', ''>, '0'>,
  test.Expect<PositiveSub<'1', ''>, '1'>,
  test.Expect<PositiveSub<'', '1'>, never>,
  test.Expect<PositiveSub<'1', '1'>, '0'>,
  test.Expect<PositiveSub<'101', '10'>, '91'>,
  test.Expect<PositiveSub<'100', '99'>, '1'>
>;

export type Sub<
  TA extends number | string,
  TB extends number | string,
> = `${TA}` extends `-${infer NA}`
  ? `${TB}` extends `-${infer NB}`
    ? {
        lt: PositiveSub<`${NB}`, NA>;
        eq: '0';
        gt: `-${PositiveSub<NA, `${NB}`>}`;
      }[Compare<NA, NB>]
    : `-${PositiveAdd<NA, `${TB}`>}`
  : `${TB}` extends `-${infer NB}`
  ? PositiveAdd<`${TA}`, `${NB}`>
  : {
      lt: `-${PositiveSub<`${TB}`, `${TA}`>}`;
      eq: '0';
      gt: PositiveSub<`${TA}`, `${TB}`>;
    }[Compare<TA, TB>];

declare const testSub: test.Describe<
  test.Expect<Sub<0, 0>, '0'>,
  test.Expect<Sub<0, 1>, '-1'>,
  test.Expect<Sub<1, 0>, '1'>,
  test.Expect<Sub<1, 1>, '0'>,
  test.Expect<Sub<-1, 1>, '-2'>,
  test.Expect<Sub<1, -1>, '2'>,
  test.Expect<Sub<-1, -1>, '0'>,
  test.Expect<Sub<0, 100>, '-100'>,
  test.Expect<Sub<200, 100>, '100'>,
  test.Expect<Sub<1000, 200>, '800'>,
  test.Expect<Sub<123, 456>, '-333'>,
  test.Expect<Sub<123, -456>, '579'>,
  test.Expect<Sub<-123, -456>, '333'>,
  test.Expect<Sub<-456, -123>, '-333'>,
  test.Expect<Sub<123, -123>, '246'>,
  test.Expect<Sub<101, 10>, '91'>,
  test.Expect<Sub<100, 99>, '1'>
>;
