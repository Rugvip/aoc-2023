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
  // - Store parts in a tuple instead of union - order of magnitude worse in most ways
  // - Storing parts in an objects - way worse even than a tuple
  // - Storing parts in a string | number union - works but can't count quite as far, also easily causes bugs
  // - Storing an additional 100 part in the string - can't count as far but is faster
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

  export type Counter<
    TOnes extends number = number,
    THundreds extends number = number,
  > = `${THundreds},${TOnes}`;

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

  export type Inc<TCounter extends Counter> =
    TCounter extends `${infer H extends number},${infer O extends number}`
      ? O extends 99
        ? Counter<0, int.Inc<H>>
        : Counter<IncTable[O], H>
      : never;

  export type Dec<TCounter extends Counter> =
    TCounter extends `${infer H extends number},${infer O extends number}`
      ? O extends 0
        ? Counter<99, int.Dec<H>>
        : Counter<DecTable[O], H>
      : never;

  type Pad0<T extends number> = `${T}` extends `${number}${number}` ? `${T}` : `0${T}`;

  export type Zero = Counter<0, 0>;

  export type IsZero<TCounter extends Counter> = TCounter extends Counter<0, 0> ? true : false;

  export type Value<TCounter extends Counter> =
    TCounter extends `${infer H extends number},${infer O extends number}`
      ? H extends 0
        ? O
        : `${H}${Pad0<O>}` extends `${infer N extends number}`
        ? N
        : never
      : never;

  declare const testAll: test.Describe<
    test.Expect<Value<Make<0>>, 0>,
    test.Expect<Value<Inc<Make<0>>>, 1>,
    test.Expect<Value<Dec<Make<1>>>, 0>,
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
