import { Input } from '../input/01';
import { dec } from './lib/math';

type DigitMap = { [K in dec.Digit as `${K}`]: K };
type StrDigitMap = {
  one: 1;
  two: 2;
  three: 3;
  four: 4;
  five: 5;
  six: 6;
  seven: 7;
  eight: 8;
  nine: 9;
} & DigitMap;

type AnyDigitMap = { [K in string]: number };

type FirstDigit<
  S extends string,
  TDigitMap extends AnyDigitMap
> = S extends `${string & keyof TDigitMap}${infer IRest}`
  ? S extends `${infer D extends string & keyof TDigitMap}${IRest}`
    ? TDigitMap[D]
    : never
  : S extends `${string}${infer IRest}`
  ? FirstDigit<IRest, TDigitMap>
  : never;

type LastDigit<
  S extends string,
  TDigitMap extends AnyDigitMap
> = S extends `${string & keyof TDigitMap}${infer IRest}`
  ? S extends `${string}${infer IRestNext}`
    ? LastDigit<IRestNext, TDigitMap> extends infer INext
      ? [INext] extends [never]
        ? S extends `${infer D extends string & keyof TDigitMap}${IRest}`
          ? TDigitMap[D]
          : never
        : INext
      : never
    : never
  : S extends `${string}${infer IRest}`
  ? LastDigit<IRest, TDigitMap>
  : never;

type Digits<S extends string, TDigitMap extends AnyDigitMap> = `${FirstDigit<
  S,
  TDigitMap
>}${LastDigit<S, TDigitMap>}`;

type Solve<
  TInput extends string,
  TDigitMap extends AnyDigitMap,
  TResult extends number = 0
> = TInput extends `${infer Line}\n${infer Rest}`
  ? Solve<Rest, TDigitMap, dec.Add<TResult, Digits<Line, TDigitMap>>>
  : TResult;

export declare const solution1: Solve<Input, DigitMap>;
export declare const solution2: Solve<Input, StrDigitMap>;
