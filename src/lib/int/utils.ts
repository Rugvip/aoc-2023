import { test } from '../test';
import { AddIntegers } from './Add';
import { Integer, ToInteger, FromInteger } from './types';

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
