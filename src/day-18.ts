import { Input } from '../input/18';
import { int, vec2 } from './lib';

// type Input1 = `R 6 (#70c710)
// D 5 (#0dc571)
// L 2 (#5713f0)
// D 2 (#d2c081)
// R 2 (#59c680)
// D 2 (#411b91)
// L 5 (#8ceee2)
// U 2 (#caa173)
// L 1 (#1b58a2)
// U 2 (#caa171)
// R 2 (#7807d2)
// U 3 (#a77fa3)
// L 2 (#015232)
// U 2 (#7a21e3)
// `;

type Dir = 'U' | 'D' | 'L' | 'R';

type Move<TDir extends Dir = Dir, TLen extends number = number> = `${TDir}${TLen}`;

type ParseMoves<
  TInput extends string,
  TResult extends string = '',
> = TInput extends `${infer IDir extends Dir} ${infer ILen extends number} (${string})\n${infer IRest}`
  ? ParseMoves<IRest, `${TResult}${Move<IDir, ILen>};`>
  : TResult;

type HexDirMap = {
  '0': 'R';
  '1': 'D';
  '2': 'L';
  '3': 'U';
};
type HexToDigit = {
  a: 10;
  b: 11;
  c: 12;
  d: 13;
  e: 14;
  f: 15;
} & { [K in int.Digit]: K };

type HexToMove<THex extends string, TResult extends number = 0> = THex extends keyof HexDirMap
  ? Move<HexDirMap[THex], TResult>
  : THex extends `${infer IHex extends keyof HexToDigit}${infer IRest}`
  ? HexToMove<IRest, int.Add<int.Multiply<TResult, 16>, HexToDigit[IHex]>>
  : TResult;

type ParseHexMoves<
  TInput extends string,
  TResult extends string = '',
> = TInput extends `${string} (#${infer IHex extends string})\n${infer IRest}`
  ? ParseHexMoves<IRest, `${TResult}${HexToMove<IHex>};`>
  : TResult;

type MoveVec2<TMove extends Move> = TMove extends Move<
  infer IDir extends Dir,
  infer ILen extends number
>
  ? {
      D: vec2.Vec2<0, ILen>;
      U: vec2.Vec2<0, int.Negate<ILen>>;
      L: vec2.Vec2<int.Negate<ILen>, 0>;
      R: vec2.Vec2<ILen, 0>;
    }[IDir]
  : never;

type MovesToArea<
  TMoves extends string,
  TCurrent extends vec2.Vec2 = vec2.Zero,
  TResult extends number = 0,
> = TMoves extends `${infer IMove extends Move};${infer IRest}`
  ? vec2.Add<TCurrent, MoveVec2<IMove>> extends infer INext extends vec2.Vec2
    ? MovesToArea<
        IRest,
        INext,
        int.Add<
          TResult,
          int.Subtract<
            int.Multiply<vec2.X<TCurrent>, vec2.Y<INext>>,
            int.Multiply<vec2.Y<TCurrent>, vec2.X<INext>>
          >
        >
      >
    : never
  : TResult;

type MovesToPerimeter<TMoves extends string, TResult extends number = 0> = TMoves extends `${Move<
  any,
  infer ILen extends number
>};${infer IRest}`
  ? MovesToPerimeter<IRest, int.Add<TResult, ILen>>
  : TResult;

type Solve<TMoves extends string> = int.Inc<
  int.Divide<int.Add<MovesToArea<TMoves>, MovesToPerimeter<TMoves>>, 2>[0]
>;

export declare const solution1: Solve<ParseMoves<Input>>;

export declare const solution2: Solve<ParseHexMoves<Input>>;
