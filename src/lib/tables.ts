import { array } from './array';

export namespace tables {
  type CounterTableSize = 1000;

  type CounterTable = array.MakeAny<CounterTableSize> extends infer IArr
    ? {
        [K in keyof IArr]: `${K & string}` extends `${infer N extends number}` ? N : never;
      }
    : never;

  export type Inc = CounterTable extends [any, ...infer CounterTable]
    ? [...CounterTable, CounterTableSize]
    : never;

  export type Dec = [-1, ...CounterTable];
}
