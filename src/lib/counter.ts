import { test } from './test';
import { int } from './math';

/**
 * A counter for counting large numbers, since a regular tuple approach only performs
 * well for a couple of thousand items, and integers to about a hundred thousands.
 * This combination of an inc/dec lookup table with a hundred entires and the rest being
 * done by regular integer arithmetic can count to a couple of hundred thousands fairly fast.
 */
export namespace counter {
  // Some other approaches tried that don't perform as well:
  // - Lookup table of size 1000 - way worse
  // - Double lookup tables for first 4 digits - a bit faster but more instantiations
  // - Just counting with a regular number - can't count to 100000
  // - Using counter arrays rather than lookup tables - slower and more instantiations

  type MakeIncTable<TTable extends number[] = []> = TTable['length'] extends 100
    ? TTable
    : MakeIncTable<[...TTable, [...TTable, any]['length']]>;
  type MakeDecTable<TTable extends number[] = []> = TTable['length'] extends 100
    ? [0, ...TTable]
    : MakeDecTable<[...TTable, TTable['length']]>;
  type IncTable = MakeIncTable;
  type DecTable = MakeDecTable;

  export type Counter<TOnes extends number = number, THundreds extends number = number> = [
    one: TOnes,
    hundred: THundreds,
  ];

  export type Make<N extends number = 0> = N extends 0
    ? Counter<0, 0>
    : int.IsNegative<N> extends true
    ? never
    : int.ToInteger<N>['digits'] extends infer D extends int.Digit[]
    ? D extends [
        ...infer IHundreds extends int.Digit[],
        infer I1 extends int.Digit,
        infer I0 extends int.Digit,
      ]
      ? Counter<
          int.FromInteger<int.Integer<'+', [I1, I0]>>,
          int.FromInteger<int.Integer<'+', IHundreds>>
        >
      : Counter<int.FromInteger<int.Integer<'+', D>>, 0>
    : never;

  export type Inc<TCounter extends Counter> = TCounter[0] extends 99
    ? [0, int.Inc<TCounter[1]>]
    : [IncTable[TCounter[0]], TCounter[1]];

  export type Dec<TCounter extends Counter> = TCounter[0] extends 0
    ? [99, int.Dec<TCounter[1]>]
    : [DecTable[TCounter[0]], TCounter[1]];

  type Pad0<T extends number> = `${T}` extends `${number}${number}` ? `${T}` : `0${T}`;
  type Trim0<T extends string> = T extends `0${infer TRest}`
    ? Trim0<TRest>
    : T extends ''
    ? '0'
    : T;

  export type IsZero<TCounter extends Counter> = TCounter extends Counter<0, 0> ? true : false;

  export type Value<TCounter extends Counter> = TCounter[1] extends 0
    ? TCounter[0]
    : Trim0<`${TCounter[1]}${Pad0<TCounter[0]>}`> extends `${infer N extends number}`
    ? int.IsNegative<N> extends true
      ? never
      : N
    : never;

  declare const testAll: test.Describe<
    test.Expect<Value<Make<0>>, 0>,
    test.Expect<Value<Inc<Make<0>>>, 1>,
    test.Expect<Value<Dec<Make<1>>>, 0>,
    test.Expect<Value<Dec<Make<0>>>, never>, // Negative values can not be read
    test.Expect<Value<Inc<Dec<Make<0>>>>, 0>,
    test.Expect<Make<-1>, never>,
    test.Expect<Value<Make<10>>, 10>,
    test.Expect<Value<Make<100>>, 100>,
    test.Expect<Value<Make<1000>>, 1000>,
    test.Expect<Value<Make<10000>>, 10000>,
    test.Expect<Value<Make<100000>>, 100000>,
    test.Expect<Value<Dec<Make<10>>>, 9>,
    test.Expect<Value<Dec<Make<100>>>, 99>,
    test.Expect<Value<Dec<Make<1000>>>, 999>,
    test.Expect<Value<Dec<Make<10000>>>, 9999>,
    test.Expect<Value<Dec<Make<100000>>>, 99999>,
    test.Expect<Value<Inc<Make<9>>>, 10>,
    test.Expect<Value<Inc<Make<99>>>, 100>,
    test.Expect<Value<Inc<Make<999>>>, 1000>,
    test.Expect<Value<Inc<Make<9999>>>, 10000>,
    test.Expect<Value<Inc<Make<99999>>>, 100000>
  >;
}
