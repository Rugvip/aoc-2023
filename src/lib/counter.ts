import { test } from './test';
import { array } from './array';
import { int } from './math';

// A counter for counting large numbers, since a regular tuple approach only performs well for a couple of thousand items.
export namespace counter {
  export type Counter<
    TOnes extends any[] = any[],
    THundreds extends any[] = any[],
    TTenThousands extends number = number,
  > = [one: TOnes, hundred: THundreds, tenThousands: TTenThousands];

  export type Make<N extends number = 0> = N extends 0
    ? Counter<[], [], 0>
    : int.IsNegative<N> extends true
    ? never
    : int.ToInteger<N>['digits'] extends infer D extends int.Digit[]
    ? D extends [
        ...infer ITenThousands extends int.Digit[],
        infer IH1 extends int.Digit,
        infer IH0 extends int.Digit,
        infer I1 extends int.Digit,
        infer I0 extends int.Digit,
      ]
      ? Counter<
          array.Make<int.FromInteger<int.Integer<'+', [I1, I0]>>>,
          array.Make<int.FromInteger<int.Integer<'+', [IH1, IH0]>>>,
          int.FromInteger<int.Integer<'+', ITenThousands>>
        >
      : D extends [
          ...infer IHundreds extends int.Digit[],
          infer I1 extends int.Digit,
          infer I0 extends int.Digit,
        ]
      ? Counter<
          array.Make<int.FromInteger<int.Integer<'+', [I1, I0]>>>,
          array.Make<int.FromInteger<int.Integer<'+', IHundreds>>>,
          0
        >
      : Counter<array.Make<int.FromInteger<int.Integer<'+', D>>>, [], 0>
    : never;

  export type Inc<TCounter extends Counter> = TCounter[0]['length'] extends 99
    ? TCounter[1]['length'] extends 99
      ? [[], [], int.Add<TCounter[2], 1>]
      : [[], [...TCounter[1], any], TCounter[2]]
    : [[...TCounter[0], any], TCounter[1], TCounter[2]];

  type Array99 = array.Make<99>;

  export type Dec<TCounter extends Counter> = TCounter[0] extends [any, ...infer IRest]
    ? [IRest, TCounter[1], TCounter[2]]
    : TCounter[1] extends [any, ...infer IRest]
    ? [Array99, IRest, TCounter[2]]
    : [Array99, Array99, int.Subtract<TCounter[2], 1>];

  type Pad0<T extends number> = `${T}` extends `${number}${number}` ? `${T}` : `0${T}`;
  type Trim0<T extends string> = T extends `0${infer TRest}`
    ? Trim0<TRest>
    : T extends ''
    ? '0'
    : T;

  export type IsZero<TCounter extends Counter> = TCounter extends Counter<[], [], 0> ? true : false;

  export type Value<TCounter extends Counter> = Trim0<`${TCounter[2]}${Pad0<
    TCounter[1]['length']
  >}${Pad0<TCounter[0]['length']>}`> extends `${infer N extends number}`
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
