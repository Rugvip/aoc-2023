import { test } from '../test';
import { Bit, Digit } from './types';
import { DigitwiseStrSubtract } from './Subtract';
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

export type DigitwiseStrAdd<
  TA extends string,
  TB extends string,
  TC extends Bit = 0,
  TResult extends string = '',
> = TA extends `${infer IARest}${Digit}`
  ? TA extends `${IARest}${infer IA0 extends Digit}`
    ? TB extends `${infer IBRest}${Digit}`
      ? TB extends `${IBRest}${infer IB0 extends Digit}`
        ? DigitAddMap[TC][IA0][IB0] extends [infer IC extends Bit, infer IR extends Digit]
          ? DigitwiseStrAdd<IARest, IBRest, IC, `${IR}${TResult}`>
          : never
        : never
      : DigitAddMap[TC][IA0][0] extends [infer IC extends Bit, infer IR extends Digit]
      ? DigitwiseStrAdd<IARest, '', IC, `${IR}${TResult}`>
      : never
    : never
  : TB extends `${infer IBRest}${Digit}`
  ? TB extends `${IBRest}${infer IB0 extends Digit}`
    ? DigitAddMap[TC][0][IB0] extends [infer IC extends Bit, infer IR extends Digit]
      ? DigitwiseStrAdd<'', IBRest, IC, `${IR}${TResult}`>
      : never
    : never
  : TC extends 1
  ? `${TC}${TResult}`
  : TResult;

declare const testDigitwiseStrAdd: test.Describe<
  test.Expect<DigitwiseStrAdd<'', ''>, ''>,
  test.Expect<DigitwiseStrAdd<'', '0'>, '0'>,
  test.Expect<DigitwiseStrAdd<'0', ''>, '0'>,
  test.Expect<DigitwiseStrAdd<'1', ''>, '1'>,
  test.Expect<DigitwiseStrAdd<'', '1'>, '1'>,
  test.Expect<DigitwiseStrAdd<'1', '1'>, '2'>,
  test.Expect<DigitwiseStrAdd<'10', '101'>, '111'>,
  test.Expect<DigitwiseStrAdd<'010', '111'>, '121'>,
  test.Expect<DigitwiseStrAdd<'875', '125'>, '1000'>
>;

export type Add<
  TA extends number | string,
  TB extends number | string,
> = `${TA}` extends `-${infer NA}`
  ? `${TB}` extends `-${infer NB}`
    ? `-${DigitwiseStrAdd<NA, NB>}`
    : {
        lt: DigitwiseStrSubtract<`${TB}`, NA>;
        eq: '0';
        gt: `-${DigitwiseStrSubtract<NA, `${TB}`>}`;
      }[Compare<NA, TB>]
  : `${TB}` extends `-${infer NB}`
  ? {
      lt: `-${DigitwiseStrSubtract<NB, `${TA}`>}`;
      eq: '0';
      gt: DigitwiseStrSubtract<`${TA}`, NB>;
    }[Compare<TA, NB>]
  : DigitwiseStrAdd<`${TA}`, `${TB}`>;

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
