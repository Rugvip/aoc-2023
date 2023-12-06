import { Input } from '../input/03';
import { int } from './lib/math';
import { PopUnion } from './lib/utils';

// type Input = `467..114..
// ...*......
// ..35..633.
// ......#...
// 617*......
// .....+.58.
// ..592.....
// ......755.
// ...$.*....
// .664.598..
// `;

type ToArray<S extends string> = S extends `${infer Char}${infer Rest}`
  ? [Char, ...ToArray<Rest>]
  : [];
type ToGrid<
  S extends string,
  Rows extends any[] = []
> = S extends `${infer Line}\n${infer Rest}`
  ? ToGrid<Rest, [...Rows, ToArray<Line>]>
  : { width: Rows[0]['length']; height: Rows['length']; cells: Rows };

type Grid = {
  width: number;
  height: number;
  cells: string[][];
};

type InputGrid = ToGrid<Input>;
type InputGridNumbers = FindGridNumbers<Input>;

type GridItem<
  TGrid extends Grid,
  TX extends number,
  TY extends number
> = TY extends any
  ? Exclude<
      undefined extends TGrid['cells'][TY] ? undefined : TGrid['cells'][TY][TX],
      undefined
    >
  : never;

type GridNumber = {
  x: number;
  y: number;
  str: string;
};

type StrDigit = `${int.Digit}`;

type FindGridNumber<
  S extends string,
  TNumbers extends GridNumber[],
  TXArr extends any[],
  TYArr extends any[],
  TNumber extends GridNumber
> = S extends `${infer IChar}${infer IRest}`
  ? IChar extends StrDigit
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
    : IChar extends StrDigit
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

type FilterGridNumbers<
  TGrid extends Grid,
  TNumbers extends GridNumber[],
  TResult extends number[] = []
> = TNumbers extends [
  infer IHead extends GridNumber,
  ...infer IRest extends GridNumber[]
]
  ? [Exclude<GridItem<TGrid, IHead['x'], IHead['y']>, StrDigit | '.'>] extends [
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
  ? Sum<IRest, int.Add<IHead, TResult>>
  : TResult;

export declare const solution1: Sum<MatchingNumbers>;

type Gear = { x: number; y: number };

type FindGridGears<
  TGrid extends Grid,
  TXCounter extends any[] = [],
  TYCounter extends any[] = []
> = TXCounter['length'] extends TGrid['width']
  ? FindGridGears<TGrid, [], [...TYCounter, any]>
  : TYCounter['length'] extends TGrid['height']
  ? []
  : GridItem<TGrid, TXCounter['length'], TYCounter['length']> extends '*'
  ? [
      { x: TXCounter['length']; y: TYCounter['length'] },
      ...FindGridGears<TGrid, [...TXCounter, any], TYCounter>
    ]
  : FindGridGears<TGrid, [...TXCounter, any], TYCounter>;

type FindGearNumbers<
  TGear extends Gear,
  TNumbers extends GridNumber // union
> = TNumbers extends any
  ? TGear extends Pick<TNumbers, 'y' | 'x'>
    ? TNumbers['str'] extends `${infer N extends number}`
      ? N
      : never
    : never
  : never;

type GearNumberProduct<N extends number> = PopUnion<N> extends {
  next: infer A extends number;
  rest: infer R extends number;
}
  ? PopUnion<R> extends {
      next: infer B extends number;
      rest: never;
    }
    ? int.Multiply<A, B>
    : 0
  : 0;

type SumGridGears<
  TGears extends Gear[],
  TNumbers extends GridNumber
> = TGears extends [infer IHead extends Gear, ...infer IRest extends Gear[]]
  ? FindGearNumbers<IHead, TNumbers> extends infer INumbers extends number
    ? int.Add<SumGridGears<IRest, TNumbers>, GearNumberProduct<INumbers>>
    : SumGridGears<IRest, TNumbers>
  : 0;

export declare const solution2: SumGridGears<
  FindGridGears<InputGrid>,
  InputGridNumbers[number]
>;
