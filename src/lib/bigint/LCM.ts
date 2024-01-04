import * as test from '../test';
import * as counter from '../counter';
import { Mul } from './Mul';
import { Div } from './Div';
import { Compare } from './Compare';

type Factors<
  N extends number | string,
  TStop extends number | string = N,
  TIt extends counter.Counter = counter.Make<2>,
  F extends string[] = [],
> = `${N}` extends '1'
  ? F
  : `${counter.Value<TIt>}` extends infer D extends string
  ? Div<N, D> extends [infer IN extends string, '0']
    ? Factors<IN, TStop, TIt, [...F, D]>
    : Factors<N, TStop, counter.Inc<TIt>, F>
  : never;

type LCMFactors<
  AFactors extends string[],
  BFactors extends string[],
  TResult extends string[] = [],
> = AFactors extends [infer A extends string, ...infer ARest extends string[]]
  ? BFactors extends [infer B extends string, ...infer BRest extends string[]]
    ? {
        lt: LCMFactors<ARest, BFactors, [...TResult, A]>;
        eq: LCMFactors<ARest, BRest, [...TResult, A]>;
        gt: LCMFactors<AFactors, BRest, [...TResult, B]>;
      }[Compare<A, B>]
    : [...TResult, ...AFactors]
  : [...TResult, ...BFactors];

type ArrProduct<TArr extends (number | string)[], TResult extends string = '1'> = TArr extends [
  infer N extends number | string,
  ...infer IRest extends (number | string)[],
]
  ? ArrProduct<IRest, Mul<TResult, N>>
  : TResult;

export type LCM<A extends number | string, B extends number | string> = [
  Factors<A>,
  Factors<B>,
] extends [infer AFactors extends string[], infer BFactors extends string[]]
  ? ArrProduct<LCMFactors<AFactors, BFactors>>
  : never;

declare const testLCM: test.Describe<
  test.Expect<LCM<2, 3>, '6'>,
  test.Expect<LCM<12, 15>, '60'>,
  test.Expect<LCM<12, 18>, '36'>
>;
