import { Test, Tests } from './utils';

export namespace bin {
  export type Bit = 0 | 1;
  export type Sign = '+' | '-';

  export type Integer = { sign: Sign; digits: Bit[] };

  type BitAddMap = [
    [[[0, 0], [0, 1]], [[0, 1], [1, 0]]],
    [[[0, 1], [1, 0]], [[1, 0], [1, 1]]]
  ];

  export type BitwiseAdd<
    TA extends Bit[],
    TB extends Bit[],
    TC extends Bit = 0,
    TResult extends Bit[] = []
  > = TA extends [...infer IARest extends Bit[], infer IA0 extends Bit]
    ? TB extends [...infer IBRest extends Bit[], infer IB0 extends Bit]
      ? BitAddMap[IA0][IB0][TC] extends [
          infer IC extends Bit,
          infer IR extends Bit
        ]
        ? BitwiseAdd<IARest, IBRest, IC, [IR, ...TResult]>
        : never
      : BitAddMap[IA0][0][TC] extends [
          infer IC extends Bit,
          infer IR extends Bit
        ]
      ? BitwiseAdd<IARest, [], IC, [IR, ...TResult]>
      : never
    : TB extends [...infer IBRest extends Bit[], infer IB0 extends Bit]
    ? BitAddMap[0][IB0][TC] extends [infer IC extends Bit, infer IR extends Bit]
      ? BitwiseAdd<[], IBRest, IC, [IR, ...TResult]>
      : never
    : TC extends 1
    ? [TC, ...TResult]
    : TResult;

  declare const testBitwiseAdd: Tests<
    [
      Test<BitwiseAdd<[], []>, []>,
      Test<BitwiseAdd<[], [0]>, [0]>,
      Test<BitwiseAdd<[0], []>, [0]>,
      Test<BitwiseAdd<[1], []>, [1]>,
      Test<BitwiseAdd<[], [1]>, [1]>,
      Test<BitwiseAdd<[1], [1]>, [1, 0]>,
      Test<BitwiseAdd<[1, 0], [1, 0, 1]>, [1, 1, 1]>,
      Test<BitwiseAdd<[0, 1, 0], [1, 1, 1]>, [1, 0, 0, 1]>
    ]
  >;
}

export namespace dec {
  type Bit = 0 | 1;
  export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  export type Sign = '+' | '-';

  export type Integer<
    TSign extends Sign = Sign,
    TDigits extends Digit[] = Digit[]
  > = { sign: TSign; digits: TDigits };

  type DigitAddResult = [carry: Bit, result: Digit];

  type MakeDigitAddResultRow<T extends DigitAddResult[]> =
    T['length'] extends 10
      ? T
      : MakeDigitAddResultRow<[...T, [0, T['length'] & Digit]]>;
  type FirstDigitAddResultRow = MakeDigitAddResultRow<[]>;
  type RotateDigitAddResultRowLeft<T extends DigitAddResult[]> = T extends [
    [0, infer IResult extends Digit],
    ...infer IRest extends DigitAddResult[]
  ]
    ? [...IRest, [1, IResult]]
    : never;
  type MakeDigitAddMap<
    T extends DigitAddResult[],
    TResult extends DigitAddResult[][] = []
  > = TResult['length'] extends 10
    ? TResult
    : MakeDigitAddMap<RotateDigitAddResultRowLeft<T>, [...TResult, T]>;

  // [carry][digit][digit]
  type DigitAddMap = [
    MakeDigitAddMap<FirstDigitAddResultRow>,
    MakeDigitAddMap<RotateDigitAddResultRowLeft<FirstDigitAddResultRow>>
  ];

  declare const testDigitAddMap: Tests<
    [
      Test<DigitAddMap[0][0][0], [0, 0]>,
      Test<DigitAddMap[0][1][0], [0, 1]>,
      Test<DigitAddMap[0][0][1], [0, 1]>,
      Test<DigitAddMap[1][0][0], [0, 1]>,
      Test<DigitAddMap[0][1][1], [0, 2]>,
      Test<DigitAddMap[1][0][1], [0, 2]>,
      Test<DigitAddMap[1][1][0], [0, 2]>,
      Test<DigitAddMap[0][9][0], [0, 9]>,
      Test<DigitAddMap[0][0][9], [0, 9]>,
      Test<DigitAddMap[1][9][0], [1, 0]>,
      Test<DigitAddMap[1][0][9], [1, 0]>,
      Test<DigitAddMap[0][9][9], [1, 8]>,
      Test<DigitAddMap[1][9][9], [1, 9]>
    ]
  >;

  export type DigitwiseAdd<
    TA extends Digit[],
    TB extends Digit[],
    TC extends Bit = 0,
    TResult extends Digit[] = []
  > = TA extends [...infer IARest extends Digit[], infer IA0 extends Digit]
    ? TB extends [...infer IBRest extends Digit[], infer IB0 extends Digit]
      ? DigitAddMap[TC][IA0][IB0] extends [
          infer IC extends Bit,
          infer IR extends Digit
        ]
        ? DigitwiseAdd<IARest, IBRest, IC, [IR, ...TResult]>
        : never
      : DigitAddMap[TC][IA0][0] extends [
          infer IC extends Bit,
          infer IR extends Digit
        ]
      ? DigitwiseAdd<IARest, [], IC, [IR, ...TResult]>
      : never
    : TB extends [...infer IBRest extends Digit[], infer IB0 extends Digit]
    ? DigitAddMap[TC][0][IB0] extends [
        infer IC extends Bit,
        infer IR extends Digit
      ]
      ? DigitwiseAdd<[], IBRest, IC, [IR, ...TResult]>
      : never
    : TC extends 1
    ? [TC, ...TResult]
    : TResult;

  declare const testDigitwiseAdd: Tests<
    [
      Test<DigitwiseAdd<[], []>, []>,
      Test<DigitwiseAdd<[], [0]>, [0]>,
      Test<DigitwiseAdd<[0], []>, [0]>,
      Test<DigitwiseAdd<[1], []>, [1]>,
      Test<DigitwiseAdd<[], [1]>, [1]>,
      Test<DigitwiseAdd<[1], [1]>, [2]>,
      Test<DigitwiseAdd<[1, 0], [1, 0, 1]>, [1, 1, 1]>,
      Test<DigitwiseAdd<[0, 1, 0], [1, 1, 1]>, [1, 2, 1]>
    ]
  >;

  type StrToDigits<S extends string> =
    S extends `${infer IChar extends Digit}${infer IRest}`
      ? [IChar, ...StrToDigits<IRest>]
      : [];
  type DigitsToStr<T extends Digit[]> = T extends [
    infer IChar extends Digit,
    ...infer IRest extends Digit[]
  ]
    ? `${IChar}${DigitsToStr<IRest>}`
    : '';

  export type ToInteger<T extends number | string> =
    `${T}` extends `-${infer I}`
      ? {
          sign: '-';
          digits: StrToDigits<I>;
        }
      : {
          sign: '+';
          digits: StrToDigits<`${T}`>;
        };

  declare const testToInteger: Tests<
    [
      Test<ToInteger<'0'>, Integer<'+', [0]>>,
      Test<ToInteger<'1'>, Integer<'+', [1]>>,
      Test<ToInteger<'123'>, Integer<'+', [1, 2, 3]>>,
      Test<ToInteger<'-0'>, Integer<'-', [0]>>,
      Test<ToInteger<'-1'>, Integer<'-', [1]>>,
      Test<ToInteger<'-123'>, Integer<'-', [1, 2, 3]>>,
      Test<ToInteger<0>, Integer<'+', [0]>>,
      Test<ToInteger<1>, Integer<'+', [1]>>,
      Test<ToInteger<123>, Integer<'+', [1, 2, 3]>>,
      Test<ToInteger<-1>, Integer<'-', [1]>>,
      Test<ToInteger<-123>, Integer<'-', [1, 2, 3]>>
    ]
  >;

  export type FromInteger<T extends Integer> = T['digits'] extends [0]
    ? 0
    : `${T['sign'] extends '-' ? '-' : ''}${DigitsToStr<
        T['digits']
      >}` extends `${infer N extends number}`
    ? N
    : never;

  declare const testFromInteger: Tests<
    [
      Test<FromInteger<Integer<'+', [0]>>, 0>,
      Test<FromInteger<Integer<'+', [1]>>, 1>,
      Test<FromInteger<Integer<'+', [1, 2, 3]>>, 123>,
      Test<FromInteger<Integer<'-', [0]>>, 0>,
      Test<FromInteger<Integer<'-', [1]>>, -1>,
      Test<FromInteger<Integer<'-', [1, 2, 3]>>, -123>
    ]
  >;

  // TODO: Only addition of positive integers for now
  export type Add<
    TA extends number | string,
    TB extends number | string
  > = FromInteger<{
    sign: '+';
    digits: DigitwiseAdd<ToInteger<TA>['digits'], ToInteger<TB>['digits']>;
  }>;

  declare const testAdd: Tests<
    [
      Test<Add<0, 0>, 0>,
      Test<Add<1, 1>, 2>,
      Test<Add<0, 1>, 1>,
      Test<Add<1, 0>, 1>,
      Test<Add<12, 23>, 35>,
      Test<Add<875, 125>, 1000>,
      Test<Add<123, 123>, 246>,
      Test<Add<'123', 123>, 246>,
      Test<Add<123, '123'>, 246>,
      Test<Add<'123', '123'>, 246>
    ]
  >;

  type CompareResult = 'lesser' | 'equal' | 'greater';
  type FlipCompareResult<T extends CompareResult> = T extends 'lesser'
    ? 'greater'
    : T extends 'greater'
    ? 'lesser'
    : 'equal';

  type CompareDigits<TA extends Digit[], TB extends Digit[]> = [
    TA,
    TB
  ] extends [
    [infer IAHead extends Digit, ...infer IARest extends Digit[]],
    [infer IBHead extends Digit, ...infer IBRest extends Digit[]]
  ]
    ? IAHead extends IBHead
      ? CompareDigits<IARest, IBRest>
      : '0123456789' extends `${string}${IAHead}${string}${IBHead}${string}`
      ? 'lesser'
      : 'greater'
    : 'equal';

  type CompareIntegers<
    TA extends Integer,
    TB extends Integer
  > = TA['sign'] extends TB['sign']
    ? (
        TA['digits']['length'] extends TB['digits']['length']
          ? CompareDigits<TA['digits'], TB['digits']>
          : Compare<TA['digits']['length'], TB['digits']['length']>
      ) extends infer IResult extends CompareResult
      ? TA['sign'] extends '-'
        ? FlipCompareResult<IResult>
        : IResult
      : never
    : TA['sign'] extends '-'
    ? 'lesser'
    : 'greater';

  export type Compare<TA extends number, TB extends number> = CompareIntegers<
    ToInteger<TA>,
    ToInteger<TB>
  >;

  declare const testCompare: Tests<
    [
      Test<Compare<5, 8>, 'lesser'>,
      Test<Compare<10, 5>, 'greater'>,
      Test<Compare<0, 0>, 'equal'>,
      Test<Compare<-5, -2>, 'lesser'>,
      Test<Compare<-10, -15>, 'greater'>,
      Test<Compare<100, 100>, 'equal'>,
      Test<Compare<-50, -50>, 'equal'>,
      Test<Compare<1000000, 999999>, 'greater'>,
      Test<Compare<-999999, -1000000>, 'greater'>,
      Test<Compare<42, 42>, 'equal'>,
      Test<Compare<-73, 73>, 'lesser'>,
      Test<Compare<999, -999>, 'greater'>
    ]
  >;
}
