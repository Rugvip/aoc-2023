import { test } from '../test';
import { Digit, Integer, ToInteger } from './index';

type CompareResult = 'lt' | 'eq' | 'gt';
type FlipCompareResult<T extends CompareResult> = T extends 'lt'
  ? 'gt'
  : T extends 'gt'
  ? 'lt'
  : 'eq';

type CompareSameLengthDigits<TA extends Digit[], TB extends Digit[]> = [TA, TB] extends [
  [infer IAHead extends Digit, ...infer IARest extends Digit[]],
  [infer IBHead extends Digit, ...infer IBRest extends Digit[]],
]
  ? IAHead extends IBHead
    ? CompareDigits<IARest, IBRest>
    : '0123456789' extends `${string}${IAHead}${string}${IBHead}${string}`
    ? 'lt'
    : 'gt'
  : 'eq';

export type CompareDigits<
  TA extends Digit[],
  TB extends Digit[],
> = TA['length'] extends TB['length']
  ? CompareSameLengthDigits<TA, TB>
  : Compare<TA['length'], TB['length']>;

type CompareIntegers<TA extends Integer, TB extends Integer> = TA[0] extends TB[0]
  ? CompareDigits<TA[1], TB[1]> extends infer IResult extends CompareResult
    ? TA[0] extends '-'
      ? FlipCompareResult<IResult>
      : IResult
    : never
  : TA[0] extends '-'
  ? 'lt'
  : 'gt';

export type Compare<TA extends number, TB extends number> = CompareIntegers<
  ToInteger<TA>,
  ToInteger<TB>
>;

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
