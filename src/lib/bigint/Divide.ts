import { test } from '../test';
import { Compare } from './Compare';
import { Digit } from './types';
import { Negate, TrimZeroes } from './utils';
import { DigitwiseStrAdd } from './Add';
import { DigitwiseStrSubtract } from './Subtract';

type CountFitDigits<
  TDividend extends string,
  TDivisor extends string,
  TAcc extends string = '',
  TResultCounter extends any[] = [],
> = DigitwiseStrAdd<TAcc, TDivisor> extends infer INext extends string
  ? Compare<INext, TDividend> extends 'gt'
    ? `${TResultCounter['length']}${TAcc}`
    : CountFitDigits<TDividend, TDivisor, INext, [...TResultCounter, any]>
  : never;

declare const testCountFitDigits: test.Describe<
  test.Expect<CountFitDigits<'', '1'>, '0'>,
  test.Expect<CountFitDigits<'3', '1'>, '33'>,
  test.Expect<CountFitDigits<'3', '2'>, '12'>,
  test.Expect<CountFitDigits<'16', '2'>, '816'>,
  test.Expect<CountFitDigits<'14', '12'>, '112'>,
  test.Expect<CountFitDigits<'60', '7'>, '856'>
>;

type DigitwiseStrDivide<
  TDividend extends string,
  TDivisor extends string,
  TResult extends string = '',
  TMem extends string = '',
> = TDividend extends `${infer IHead extends Digit}${infer IRest}`
  ? TrimZeroes<`${TMem}${IHead}`> extends infer INextMem extends string
    ? CountFitDigits<INextMem, TDivisor> extends `${infer ICount extends Digit}${infer IFit}`
      ? ICount extends 0
        ? DigitwiseStrDivide<IRest, TDivisor, `${TResult}${0}`, INextMem>
        : DigitwiseStrDivide<
            IRest,
            TDivisor,
            `${TResult}${ICount}`,
            DigitwiseStrSubtract<INextMem, IFit>
          >
      : never
    : never
  : `${TrimZeroes<TResult>}|${TrimZeroes<TMem>}`;

declare const testDigitwiseDivide: test.Describe<
  test.Expect<DigitwiseStrDivide<'0', '1'>, '0|0'>,
  test.Expect<DigitwiseStrDivide<'1', '1'>, '1|0'>,
  test.Expect<DigitwiseStrDivide<'4', '1'>, '4|0'>,
  test.Expect<DigitwiseStrDivide<'6', '3'>, '2|0'>,
  test.Expect<DigitwiseStrDivide<'8', '5'>, '1|3'>,
  test.Expect<DigitwiseStrDivide<'16', '2'>, '8|0'>,
  test.Expect<DigitwiseStrDivide<'15', '2'>, '7|1'>,
  test.Expect<DigitwiseStrDivide<'11', '2'>, '5|1'>,
  test.Expect<DigitwiseStrDivide<'23', '2'>, '11|1'>,
  test.Expect<DigitwiseStrDivide<'45', '2'>, '22|1'>,
  test.Expect<DigitwiseStrDivide<'67', '2'>, '33|1'>,
  test.Expect<DigitwiseStrDivide<'167', '2'>, '83|1'>,
  test.Expect<DigitwiseStrDivide<'136', '2'>, '68|0'>,
  test.Expect<DigitwiseStrDivide<'1367', '2'>, '683|1'>,
  test.Expect<DigitwiseStrDivide<'13676', '2'>, '6838|0'>,
  test.Expect<DigitwiseStrDivide<'100', '10'>, '10|0'>,
  test.Expect<DigitwiseStrDivide<'105', '10'>, '10|5'>,
  test.Expect<DigitwiseStrDivide<'1234', '56'>, '22|2'>
>;

export type Divide<TA extends string | number, TB extends string | number> = `${TB}` extends '0'
  ? never
  : `${TA}` extends `-${infer NA}`
  ? `${TB}` extends `-${infer NB}`
    ? DigitwiseStrDivide<NA, NB> extends `${infer IRes}|${infer IRem}`
      ? [result: IRes, remainder: Negate<IRem>]
      : never
    : DigitwiseStrDivide<NA, `${TB}`> extends `${infer IRes}|${infer IRem}`
    ? [result: Negate<IRes>, remainder: Negate<IRem>]
    : never
  : `${TB}` extends `-${infer NB}`
  ? DigitwiseStrDivide<`${TA}`, NB> extends `${infer IRes}|${infer IRem}`
    ? [result: Negate<IRes>, remainder: IRem]
    : never
  : DigitwiseStrDivide<`${TA}`, `${TB}`> extends `${infer IRes}|${infer IRem}`
  ? [result: IRes, remainder: IRem]
  : never;

declare const testDivide: test.Describe<
  test.Expect<Divide<0, 0>, never>,
  test.Expect<Divide<0, 1>, [result: '0', remainder: '0']>,
  test.Expect<Divide<0, 123>, [result: '0', remainder: '0']>,
  test.Expect<Divide<1, 1>, [result: '1', remainder: '0']>,
  test.Expect<Divide<1, 2>, [result: '0', remainder: '1']>,
  test.Expect<Divide<2, 1>, [result: '2', remainder: '0']>,
  test.Expect<Divide<8, 5>, [result: '1', remainder: '3']>,
  test.Expect<Divide<16, 2>, [result: '8', remainder: '0']>,
  test.Expect<Divide<15, 2>, [result: '7', remainder: '1']>,
  test.Expect<Divide<13676, 2>, [result: '6838', remainder: '0']>,
  test.Expect<Divide<1, -1>, [result: '-1', remainder: '0']>,
  test.Expect<Divide<-1, 1>, [result: '-1', remainder: '0']>,
  test.Expect<Divide<-1, -1>, [result: '1', remainder: '0']>,
  test.Expect<Divide<-100, -10>, [result: '10', remainder: '0']>,
  test.Expect<Divide<-105, -10>, [result: '10', remainder: '-5']>
>;
