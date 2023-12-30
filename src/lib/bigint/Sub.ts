import { test } from '../test';
import { Bit, Digit } from './types';
import { Negate, TrimZeroes } from './utils';
import { Add, DigitAddResult, FirstDigitAddResultRow } from './Add';

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
        ? DigitSubMap[TC][IB0][IA0] extends [infer IC extends Bit, infer IR extends Digit]
          ? PositiveSub<IARest, IBRest, IC, `${IR}${TResult}`>
          : never
        : never
      : DigitSubMap[TC][0][IA0] extends [infer IC extends Bit, infer IR extends Digit]
      ? PositiveSub<IARest, '', IC, `${IR}${TResult}`>
      : never
    : never
  : TB extends `${infer IBRest}${Digit}`
  ? TB extends `${IBRest}${infer IB0 extends Digit}`
    ? DigitSubMap[0][IB0][TC] extends [infer IC extends Bit, infer IR extends Digit]
      ? PositiveSub<'', IBRest, IC, `${IR}${TResult}`>
      : never
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

export type Sub<TA extends number | string, TB extends number | string> = Add<TA, Negate<TB>>;

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
  test.Expect<Sub<123, -123>, '246'>,
  test.Expect<Sub<101, 10>, '91'>,
  test.Expect<Sub<100, 99>, '1'>
>;
