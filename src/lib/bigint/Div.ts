import { test } from '../test';
import { Compare } from './Compare';
import { Digit } from './types';
import { Negate, TrimZeroes } from './utils';
import { PositiveAdd } from './Add';
import { PositiveSub } from './Sub';

type CountFitDigits<
  TDivnd extends string,
  TDivisor extends string,
  TAcc extends string = '',
  TResultCounter extends any[] = [],
> = PositiveAdd<TAcc, TDivisor> extends infer INext extends string
  ? Compare<INext, TDivnd> extends 'gt'
    ? `${TResultCounter['length']}${TAcc}`
    : CountFitDigits<TDivnd, TDivisor, INext, [...TResultCounter, any]>
  : never;

declare const testCountFitDigits: test.Describe<
  test.Expect<CountFitDigits<'', '1'>, '0'>,
  test.Expect<CountFitDigits<'3', '1'>, '33'>,
  test.Expect<CountFitDigits<'3', '2'>, '12'>,
  test.Expect<CountFitDigits<'16', '2'>, '816'>,
  test.Expect<CountFitDigits<'14', '12'>, '112'>,
  test.Expect<CountFitDigits<'60', '7'>, '856'>
>;

type PositiveDiv<
  TDivnd extends string,
  TDivisor extends string,
  TResult extends string = '',
  TMem extends string = '',
> = TDivnd extends `${infer IHead extends Digit}${infer IRest}`
  ? TrimZeroes<`${TMem}${IHead}`> extends infer INextMem extends string
    ? CountFitDigits<INextMem, TDivisor> extends `${infer ICount extends Digit}${infer IFit}`
      ? ICount extends 0
        ? PositiveDiv<IRest, TDivisor, `${TResult}${0}`, INextMem>
        : PositiveDiv<IRest, TDivisor, `${TResult}${ICount}`, PositiveSub<INextMem, IFit>>
      : never
    : never
  : `${TrimZeroes<TResult>}|${TrimZeroes<TMem>}`;

declare const testPositiveDiv: test.Describe<
  test.Expect<PositiveDiv<'0', '1'>, '0|0'>,
  test.Expect<PositiveDiv<'1', '1'>, '1|0'>,
  test.Expect<PositiveDiv<'4', '1'>, '4|0'>,
  test.Expect<PositiveDiv<'6', '3'>, '2|0'>,
  test.Expect<PositiveDiv<'8', '5'>, '1|3'>,
  test.Expect<PositiveDiv<'16', '2'>, '8|0'>,
  test.Expect<PositiveDiv<'15', '2'>, '7|1'>,
  test.Expect<PositiveDiv<'11', '2'>, '5|1'>,
  test.Expect<PositiveDiv<'23', '2'>, '11|1'>,
  test.Expect<PositiveDiv<'45', '2'>, '22|1'>,
  test.Expect<PositiveDiv<'67', '2'>, '33|1'>,
  test.Expect<PositiveDiv<'167', '2'>, '83|1'>,
  test.Expect<PositiveDiv<'136', '2'>, '68|0'>,
  test.Expect<PositiveDiv<'1367', '2'>, '683|1'>,
  test.Expect<PositiveDiv<'13676', '2'>, '6838|0'>,
  test.Expect<PositiveDiv<'100', '10'>, '10|0'>,
  test.Expect<PositiveDiv<'105', '10'>, '10|5'>,
  test.Expect<PositiveDiv<'1234', '56'>, '22|2'>
>;

export type Div<TA extends string | number, TB extends string | number> = `${TB}` extends '0'
  ? never
  : `${TA}` extends `-${infer NA}`
  ? `${TB}` extends `-${infer NB}`
    ? PositiveDiv<NA, NB> extends `${infer IRes}|${infer IRem}`
      ? [result: IRes, remainder: Negate<IRem>]
      : never
    : PositiveDiv<NA, `${TB}`> extends `${infer IRes}|${infer IRem}`
    ? [result: Negate<IRes>, remainder: Negate<IRem>]
    : never
  : `${TB}` extends `-${infer NB}`
  ? PositiveDiv<`${TA}`, NB> extends `${infer IRes}|${infer IRem}`
    ? [result: Negate<IRes>, remainder: IRem]
    : never
  : PositiveDiv<`${TA}`, `${TB}`> extends `${infer IRes}|${infer IRem}`
  ? [result: IRes, remainder: IRem]
  : never;

declare const testDiv: test.Describe<
  test.Expect<Div<0, 0>, never>,
  test.Expect<Div<0, 1>, [result: '0', remainder: '0']>,
  test.Expect<Div<0, 123>, [result: '0', remainder: '0']>,
  test.Expect<Div<1, 1>, [result: '1', remainder: '0']>,
  test.Expect<Div<1, 2>, [result: '0', remainder: '1']>,
  test.Expect<Div<2, 1>, [result: '2', remainder: '0']>,
  test.Expect<Div<8, 5>, [result: '1', remainder: '3']>,
  test.Expect<Div<16, 2>, [result: '8', remainder: '0']>,
  test.Expect<Div<15, 2>, [result: '7', remainder: '1']>,
  test.Expect<Div<13676, 2>, [result: '6838', remainder: '0']>,
  test.Expect<Div<1, -1>, [result: '-1', remainder: '0']>,
  test.Expect<Div<-1, 1>, [result: '-1', remainder: '0']>,
  test.Expect<Div<-1, -1>, [result: '1', remainder: '0']>,
  test.Expect<Div<-100, -10>, [result: '10', remainder: '0']>,
  test.Expect<Div<-105, -10>, [result: '10', remainder: '-5']>
>;
