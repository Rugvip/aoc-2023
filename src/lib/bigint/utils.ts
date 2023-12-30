import { test } from '../test';
import { Add } from './Add';

export type Negate<T extends string | number> = `${T}` extends '0'
  ? '0'
  : `${T}` extends `-${infer N}`
  ? N
  : `-${T}` extends `${infer N}`
  ? N
  : never;

export type IsNegative<T extends string | number> = `${T}` extends `-${string}` ? true : false;

export type SignOf<T extends string | number> = `${T}` extends `-${string}` ? '-' : '+';

export type Abs<T extends string | number> = `${T}` extends `-${infer N}` ? N : `${T}`;

declare const testAbs: test.Describe<
  test.Expect<Abs<0>, '0'>,
  test.Expect<Abs<-1>, '1'>,
  test.Expect<Abs<1>, '1'>,
  test.Expect<Abs<-99>, '99'>,
  test.Expect<Abs<99>, '99'>
>;

export type Inc<TA extends string | number> = Add<TA, '1'>;

declare const testInc: test.Describe<
  test.Expect<Inc<0>, '1'>,
  test.Expect<Inc<-1>, '0'>,
  test.Expect<Inc<1>, '2'>,
  test.Expect<Inc<999999>, '1000000'>
>;

export type Dec<TA extends string | number> = Add<TA, '-1'>;

declare const testDec: test.Describe<
  test.Expect<Dec<0>, '-1'>,
  test.Expect<Dec<-1>, '-2'>,
  test.Expect<Dec<1>, '0'>,
  test.Expect<Dec<1000000>, '999999'>
>;

export type TrimZeroes<S extends string> = S extends '0'
  ? S
  : S extends `0${infer I}`
  ? TrimZeroes<I>
  : S;
