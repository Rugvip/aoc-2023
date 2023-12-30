import { test } from '../test';

type CompareResult = 'lt' | 'eq' | 'gt';
type FlipCompareResult<T extends CompareResult> = T extends 'lt'
  ? 'gt'
  : T extends 'gt'
  ? 'lt'
  : 'eq';

type CompareSameLengthRevStrDigits<
  TA extends string,
  TB extends string,
> = TA extends `${infer IAHead}${infer IARest}`
  ? TB extends `${infer IBHead}${infer IBRest}`
    ? IAHead extends IBHead
      ? CompareSameLengthRevStrDigits<IARest, IBRest>
      : '0123456789' extends `${string}${IAHead}${string}${IBHead}${string}`
      ? 'lt'
      : 'gt'
    : 'eq'
  : 'eq';

type CompareStr<
  TA extends string,
  TB extends string,
  RA extends string = TA,
  RB extends string = TB,
> = RA extends `${string}${infer IARest}`
  ? RB extends `${string}${infer IBRest}`
    ? CompareStr<TA, TB, IARest, IBRest>
    : 'gt'
  : RB extends `${infer _}${string}`
  ? 'lt'
  : CompareSameLengthRevStrDigits<TA, TB>;

export type Compare<
  TA extends number | string,
  TB extends number | string,
> = `${TA}` extends `-${infer NA}`
  ? `${TB}` extends `-${infer NB}`
    ? FlipCompareResult<CompareStr<NA, NB>>
    : 'lt'
  : `${TB}` extends `-${string}`
  ? 'gt'
  : CompareStr<`${TA}`, `${TB}`>;

declare const testCompare: test.Describe<
  test.Expect<Compare<5, 8>, 'lt'>,
  test.Expect<Compare<10, 5>, 'gt'>,
  test.Expect<Compare<0, 0>, 'eq'>,
  test.Expect<Compare<-5, -2>, 'lt'>,
  test.Expect<Compare<-10, -15>, 'gt'>,
  test.Expect<Compare<100, 100>, 'eq'>,
  test.Expect<Compare<-50, -50>, 'eq'>,
  test.Expect<Compare<1000000, 999999>, 'gt'>,
  test.Expect<Compare<-999999, -1000000>, 'gt'>,
  test.Expect<Compare<42, 42>, 'eq'>,
  test.Expect<Compare<-73, 73>, 'lt'>,
  test.Expect<Compare<999, -999>, 'gt'>
>;

export type Min<A extends number, B extends number> = Compare<A, B> extends 'lt' ? A : B;
export type Max<A extends number, B extends number> = Compare<A, B> extends 'gt' ? A : B;

declare const testMin: test.Describe<
  test.Expect<Min<5, 2>, 2>,
  test.Expect<Min<-5, -12345>, -12345>,
  test.Expect<Min<-1, 1>, -1>,
  test.Expect<Min<0, -1>, -1>,
  test.Expect<Min<0, 1>, 0>
>;

declare const testMax: test.Describe<
  test.Expect<Max<5, 2>, 5>,
  test.Expect<Max<-5, -12345>, -5>,
  test.Expect<Max<-1, 1>, 1>,
  test.Expect<Max<0, -1>, 0>,
  test.Expect<Max<0, 1>, 1>
>;
