import * as array from './array';
import * as test from './test';

export type TrimRight<
  S extends string,
  TTrim extends string = ' ',
> = S extends `${infer IRest}${TTrim}` ? TrimLeft<IRest, TTrim> : S;

export type TrimLeft<
  S extends string,
  TTrim extends string = ' ',
> = S extends `${TTrim}${infer IRest}` ? TrimLeft<IRest, TTrim> : S;

export type Trim<S extends string, TTrim extends string = ' '> = TrimLeft<
  TrimRight<S, TTrim>,
  TTrim
>;

export type ToChars<
  S extends string,
  TArr extends string[] = [],
> = S extends `${infer IChar}${infer IRest}` ? ToChars<IRest, [...TArr, IChar]> : TArr;

export type ToNumber<S extends string> = S extends `${infer N extends number}` ? N : never;

export type Join<
  TArr extends (string | number)[],
  TJoin extends string = '',
  TResult extends string = '',
> = TArr extends [
  infer IA extends string | number,
  infer IB extends string | number,
  ...infer IRest extends (string | number)[],
]
  ? Join<[IB, ...IRest], TJoin, TResult extends '' ? `${IA}` : `${TResult}${TJoin}${IA}`>
  : TArr extends [infer IA extends string | number]
  ? TResult extends ''
    ? `${IA}`
    : `${TResult}${TJoin}${IA}`
  : '';

declare const testJoin: test.Describe<
  test.Expect<Join<[]>, ''>,
  test.Expect<Join<[], '-'>, ''>,
  test.Expect<Join<[1], ''>, '1'>,
  test.Expect<Join<[1], '-'>, '1'>,
  test.Expect<Join<[1, 2], ''>, '12'>,
  test.Expect<Join<[1, 2], '-'>, '1-2'>,
  test.Expect<Join<[1, 2, 3], ''>, '123'>,
  test.Expect<Join<[1, 2, 3], '-'>, '1-2-3'>,
  test.Expect<Join<[1, 2, 3], `${',' | '-'}`>, `1${',' | '-'}2${',' | '-'}3`>,
  test.Expect<Join<['a'], ''>, 'a'>,
  test.Expect<Join<['a'], '-'>, 'a'>,
  test.Expect<Join<['a', 'b'], ''>, 'ab'>,
  test.Expect<Join<['a', 'b'], '-'>, 'a-b'>,
  test.Expect<Join<['a', 'b', 'c'], ''>, 'abc'>,
  test.Expect<Join<['a', 'b', 'c'], '-'>, 'a-b-c'>,
  test.Expect<Join<['a', 'b', 'c'], `${',' | '-'}`>, `a${',' | '-'}b${',' | '-'}c`>,
  test.Expect<Join<array.Make<20, '1'>, ''>, '11111111111111111111'>,
  test.Expect<Join<array.Make<20, '1'>, '0'>, '101010101010101010101010101010101010101'>
>;

export type Split<
  S extends string,
  TSplitter extends string,
  TResult extends string[] = [],
> = S extends `${infer IHead}${TSplitter}${infer IRest}`
  ? Split<IRest, TSplitter, [...TResult, IHead]>
  : [...TResult, S];
