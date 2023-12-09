import { test } from './test';
import { utils } from './utils';

export namespace objects {
  type Any = { [K in string]: any };
  type AnyTable = { [K in string]: any[] };

  export type AppendAt<
    T extends Any | AnyTable,
    TName extends string,
    TValue extends any,
  > = TName extends keyof T
    ? {
        [K in keyof T]: K extends TName
          ? T[K] extends any[]
            ? [...T[K], TValue]
            : [T[K], TValue]
          : T[K];
      }
    : utils.Expand<
        T & {
          [K in TName]: [TValue];
        }
      >;

  declare const testAppendAt: test.Describe<
    test.Expect<AppendAt<{}, 'a', 1>, { a: [1] }>,
    test.Expect<AppendAt<{ a: [1] }, 'a', 2>, { a: [1, 2] }>,
    test.Expect<AppendAt<{ a: [1]; b: [] }, 'a', 2>, { a: [1, 2]; b: [] }>,
    test.Expect<AppendAt<{ a: 1 }, 'a', 2>, { a: [1, 2] }>,
    test.Expect<AppendAt<{ b: [2] }, 'a', 1>, { a: [1]; b: [2] }>
  >;

  export type Set<T extends Any, TName extends string, TValue extends any> = TName extends keyof T
    ? {
        [K in keyof T]: K extends TName ? TValue : T[K];
      }
    : utils.Expand<
        T & {
          [K in TName]: TValue;
        }
      >;
  {
  }
  declare const testSet: test.Describe<
    test.Expect<Set<{}, 'a', 1>, { a: 1 }>,
    test.Expect<Set<{ a: 1 }, 'a', 2>, { a: 2 }>,
    test.Expect<Set<{ a: 1; b: 3 }, 'a', 2>, { a: 2; b: 3 }>,
    test.Expect<Set<{ b: 2 }, 'a', 1>, { a: 1; b: 2 }>
  >;
}
