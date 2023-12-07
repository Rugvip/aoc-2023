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

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type PopUnion<U> = UnionToIntersection<U extends any ? () => U : never> extends () => infer R
  ? { rest: Exclude<U, R>; next: R }
  : undefined;

export type UnionSize<U, TCounter extends any[] = [], TPop = PopUnion<U>> = TPop extends {
  next: any;
  rest: infer IRest;
}
  ? UnionSize<IRest, [...TCounter, any]>
  : TCounter['length'];

declare const testUnionSize: test.Describe<
  test.Expect<UnionSize<never>, 0>,
  test.Expect<UnionSize<'a'>, 1>,
  test.Expect<UnionSize<'a' | 'b' | 'c'>, 3>,
  test.Expect<UnionSize<string | number>, 2>
>;

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
