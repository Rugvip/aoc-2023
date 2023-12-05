import { Input } from '../input/03';
import { dec } from './lib/math';

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

type StrDigit = `${dec.Digit}`;

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
  ? Sum<IRest, dec.Add<IHead, TResult>>
  : TResult;

export declare const solution1: Sum<MatchingNumbers>;
