import { Input } from '../input/03';

// type Input = `467..114..
// ...*......
// ..35..633.
// ......#...
// 617*......
// .....+.58.
// ..592.....
// ......755.
// ...$.*....
// .664.598..`;

type ToArray<S extends string> = S extends `${infer Char}${infer Rest}`
  ? [Char, ...ToArray<Rest>]
  : [];
type ToGrid<
  S extends string,
  Rows extends any[] = []
> = S extends `${infer Line}\n${infer Rest}`
  ? ToGrid<Rest, [...Rows, ToArray<Line>]>
  : S extends ''
  ? { width: Rows[0]['length']; height: Rows['length']; cells: Rows }
  : ToGrid<'', [...Rows, ToArray<S>]>;

type Grid = {
  width: number;
  height: number;
  cells: string[][];
};

type TupleKeys<T extends any[]> = keyof {
  [K in keyof T as number extends K
    ? never
    : K extends `${infer N extends number}`
    ? N
    : never]: K;
};

type GridItem<TGrid extends Grid, TX extends number, TY extends number> = [
  TX,
  TY
] extends [TupleKeys<TGrid['cells'][0]>, TupleKeys<TGrid['cells']>]
  ? TGrid['cells'][TY][TX]
  : null;

type InputGrid = ToGrid<Input>;

type MakeTuple<
  TLength extends number | string,
  TResult extends any[] = []
> = `${TResult['length']}` extends `${TLength}`
  ? TResult
  : MakeTuple<TLength, [...TResult, any]>;

type Inc<T extends number> = [...MakeTuple<T>, any]['length'];
type Dec<T extends number> = MakeTuple<T> extends [any, ...infer Rest]
  ? Rest['length']
  : 0;

type GridNumber = {
  x: number;
  y: number;
  str: string;
};

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type FindGridNumber<
  S extends string,
  TNumbers extends GridNumber[],
  TXArr extends any[],
  TYArr extends any[],
  TNumber extends GridNumber
> = S extends `${infer IChar}${infer IRest}`
  ? IChar extends Digit
    ? [...TXArr, any] extends infer IXArr extends any[]
      ? FindGridNumber<
          IRest,
          TNumbers,
          IXArr,
          TYArr,
          {
            x: TNumber['x'] | IXArr['length'];
            y: TNumber['y'];
            str: `${TNumber['str']}${IChar}`;
          }
        >
      : never
    : IChar extends '\n'
    ? FindGridNumbers<IRest, [...TNumbers, TNumber], [], [...TYArr, any]>
    : FindGridNumbers<IRest, [...TNumbers, TNumber], [...TXArr, any], TYArr>
  : [...TNumbers, TNumber];

type FindGridNumbers<
  S extends string,
  TNumbers extends GridNumber[] = [],
  TXArr extends any[] = [],
  TYArr extends any[] = []
> = S extends `${infer IChar}${infer IRest}`
  ? IChar extends '\n'
    ? FindGridNumbers<IRest, TNumbers, [], [...TYArr, any]>
    : IChar extends Digit
    ? FindGridNumber<
        IRest,
        TNumbers,
        [...TXArr, any],
        TYArr,
        {
          x:
            | (TXArr extends [any, ...infer IDec] ? IDec['length'] : 0)
            | TXArr['length']
            | [...TXArr, any]['length'];
          y:
            | (TYArr extends [any, ...infer IDec] ? IDec['length'] : 0)
            | TYArr['length']
            | [...TYArr, any]['length'];
          str: IChar;
        }
      >
    : FindGridNumbers<IRest, TNumbers, [...TXArr, any], TYArr>
  : TNumbers;

type InputGridNumbers = FindGridNumbers<Input>;

type q01 = GridItem<
  InputGrid,
  InputGridNumbers[0]['x'],
  InputGridNumbers[0]['y']
>;
type q02 = Exclude<q01, Digit | '.'>;
type q03 = [q02] extends [never] ? false : true;
type q11 = GridItem<
  InputGrid,
  InputGridNumbers[1]['x'],
  InputGridNumbers[1]['y']
>;
type q12 = Exclude<q11, Digit | '.'>;
type q13 = [q12] extends [never] ? false : true;

type FilterGridNumbers<
  TGrid extends Grid,
  TNumbers extends GridNumber[],
  TResult extends number[] = []
> = TNumbers extends [
  infer IHead extends GridNumber,
  ...infer IRest extends GridNumber[]
]
  ? [Exclude<GridItem<TGrid, IHead['x'], IHead['y']>, Digit | '.'>] extends [
      never
    ]
    ? FilterGridNumbers<TGrid, IRest, TResult>
    : FilterGridNumbers<
        TGrid,
        IRest,
        [
          ...TResult,
          IHead['str'] extends `${infer INum extends number}` ? INum : never
        ]
      >
  : TResult;

type MatchingNumbers = FilterGridNumbers<InputGrid, InputGridNumbers>;

type Sum<
  TNumbers extends number[],
  TResult extends number = 0
> = TNumbers extends [
  infer IHead extends number,
  ...infer IRest extends number[]
]
  ? Sum<
      IRest,
      Add<IHead, TResult> extends `${infer INumber extends number}`
        ? INumber
        : never
    >
  : TResult;

// ADD

type AddMap = {
  [K in `${Digit}${Digit}${
    | '0'
    | '1'}`]: K extends `${infer A extends Digit}${infer B extends Digit}${infer C extends
    | '0'
    | '1'}`
    ? `${[...MakeTuple<A>, ...MakeTuple<B>, ...MakeTuple<C>]['length'] &
        number}` extends infer S
      ? S extends `${Digit}`
        ? `0${S}`
        : S
      : never
    : never;
};

type AddRevStrCarry<N extends string, C extends '0' | '1'> = C extends '0'
  ? ReverseStr<N>
  : N extends `${infer N1 extends Digit}${infer NR}`
  ? AddMap[`${N1}0${C}`] extends `${infer C2 extends '0' | '1'}${infer S}`
    ? `${AddRevStrCarry<NR, C2>}${S}`
    : never
  : C;

type k = AddRevStrCarry<'9', '1'>;
type AddRevStr<
  A extends string,
  B extends string,
  C extends '0' | '1' = '0'
> = [A, B] extends [
  `${infer A1 extends Digit}${infer AR}`,
  `${infer B1 extends Digit}${infer BR}`
]
  ? AddMap[`${A1}${B1}${C}`] extends `${infer C2 extends '0' | '1'}${infer S}`
    ? `${AddRevStr<AR, BR, C2>}${S}`
    : never
  : [A, B] extends ['', '']
  ? C extends '1'
    ? '1'
    : ''
  : AddRevStrCarry<A extends '' ? B : A, C>;

type ReverseStr<S extends string> = S extends `${infer C}${infer Rest}`
  ? `${ReverseStr<Rest>}${C}`
  : S;

type Add<A extends number, B extends number> = AddRevStr<
  ReverseStr<`${A}`>,
  ReverseStr<`${B}`>
>;

export declare const solution1: Sum<MatchingNumbers>;
// 536273
