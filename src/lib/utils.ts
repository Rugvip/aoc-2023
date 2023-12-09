import { test } from './test';

export type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

export type ExpandRecursively<T> = T extends (...args: infer A) => infer R
  ? (...args: ExpandRecursively<A>) => ExpandRecursively<R>
  : T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

export type ArrayIndices<T extends any[]> = Exclude<
  keyof T,
  keyof []
> extends `${infer I extends number}`
  ? I
  : never;

declare const testArrayIndices: test.Describe<
  test.Expect<ArrayIndices<[]>, never>,
  test.Expect<ArrayIndices<[1]>, 0>,
  test.Expect<ArrayIndices<[1, 2]>, 0 | 1>,
  test.Expect<ArrayIndices<[[], never, any]>, 0 | 1 | 2>
>;
