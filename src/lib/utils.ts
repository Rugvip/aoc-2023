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

export type Test<TActual, TExpected> = [
  pass: (<T>() => T extends TActual ? 1 : 2) extends <T>() => T extends TExpected ? 1 : 2
    ? true
    : false,
  actual: TActual,
  expected: TExpected,
];
type TestResult<T extends boolean = boolean> = [pass: T, actual: any, expected: any];
type OnlyFailingTests<T extends TestResult[], TChecked extends any[] = []> = T extends [
  [infer IR, ...infer IData],
  ...infer IRest extends TestResult[],
]
  ? IR extends false
    ? [[index: TChecked['length'], ...IData], ...OnlyFailingTests<IRest, [...TChecked, any]>]
    : OnlyFailingTests<IRest, [...TChecked, any]>
  : [];

export type Tests<T extends TestResult<true>[]> = ExpandRecursively<OnlyFailingTests<T>>;

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type PopUnion<U> = UnionToIntersection<U extends any ? () => U : never> extends () => infer R
  ? { rest: Exclude<U, R>; next: R }
  : undefined;
