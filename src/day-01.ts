import { Input } from '../input/01';

// type Input = `two1nine
// eightwothree
// abcone2threexyz
// xtwone3four
// 4nineeightseven2
// zoneight234
// 7pqrstsixteen
// `;

type Lines<
  S extends string,
  Result extends string[] = []
> = S extends `${infer L}\n${infer R}` ? Lines<R, [...Result, L]> : Result;

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type FirstDigit<S extends string> =
  S extends `${infer D extends Digit}${string}`
    ? D
    : S extends `${string}${infer Rest}`
    ? FirstDigit<Rest>
    : never;
type LastDigit<S extends string> =
  S extends `${infer D extends Digit}${infer Rest}`
    ? LastDigit<Rest> extends infer Next
      ? [Next] extends [never]
        ? D
        : Next
      : never
    : S extends `${string}${infer Rest}`
    ? LastDigit<Rest>
    : never;
type Digits<S extends string> = `${FirstDigit<S>}${LastDigit<S>}`;

type StrDigitMap = {
  zero: '0';
  one: '1';
  two: '2';
  three: '3';
  four: '4';
  five: '5';
  six: '6';
  seven: '7';
  eight: '8';
  nine: '9';
};
type StrDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
// type StrDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | keyof StrDigitMap;
// type FirstDigit<S extends string> =
//   S extends `${infer D extends Digit}${string}`
//     ? D
//     : S extends `${string}${infer Rest}`
//     ? FirstDigit<Rest>
//     : never;
// type LastDigit<S extends string> =
//   S extends `${infer D extends Digit}${infer Rest}`
//     ? LastDigit<Rest> extends infer Next
//       ? [Next] extends [never]
//         ? D
//         : Next
//       : never
//     : S extends `${string}${infer Rest}`
//     ? LastDigit<Rest>
//     : never;
type StrDigits<S extends string> = `${FirstDigit<S>}${LastDigit<S>}`;

type MakeTuple<
  N extends number | string,
  T extends any[] = []
> = `${T['length']}` extends `${N}` ? T : MakeTuple<N, [...T, any]>;

type Add2<A extends number | string, B extends number | string> = [
  ...MakeTuple<A>,
  ...MakeTuple<B>
]['length'];

type x2 = Add2<'1', '22'>;

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

type asd = `${1}` & `${Digit}`;

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

type w = 'a' extends `${infer u}${infer y}` ? u : never;

type x3 = AddRevStr<'25', '2'>;
type x4 = AddMap['000'] extends `${infer C2 extends '0' | '1'}${infer S}`
  ? `${C2}-${S}`
  : never;

type ReverseStr<S extends string> = S extends `${infer C}${infer Rest}`
  ? `${ReverseStr<Rest>}${C}`
  : S;

type Add<A extends number | string, B extends number | string> = AddRevStr<
  ReverseStr<`${A}`>,
  ReverseStr<`${B}`>
>;

type r2 = Add<'12345', '11'>;

type y1 = Add<'1', '999'>;
type y2 = Add<'75', '925'>;
type y3 = Add<'1', '2'>;

type Solve<
  TInput extends string,
  Result extends string = '0'
> = TInput extends `${infer Line}\n${infer Rest}`
  ? Solve<Rest, Add<Result, Digits<Line>>>
  : Result;

// type Solve2<
//   TInput extends string,
//   Result extends number = '0'
// > = TInput extends `${infer Line}\n${infer Rest}`
//   ? Solve2<Rest, Add<Result, StrDigits<Line>>>
//   : Result;

export declare const solution1: Solve<Input>;
// 56108
// type Solved2 = Solve2<Input>;

type LinesDigits<TLines extends string[]> = TLines extends [
  infer Line extends string,
  ...infer Rest extends string[]
]
  ? [Digits<Line>, ...LinesDigits<Rest>]
  : [];

type asd1 = Lines<Input>;
type asd2 = LinesDigits<Lines<Input>>;

// type SumDigits<
//   TDigits extends string[],
//   TResult extends number = 0
// > = TDigits extends [infer D extends string, ...infer Rest extends string[]]
//   ? SumDigits<Rest, Add<D, TResult>>
//   : TResult;

type t1 = Add<'12', '2'>;

// type Solve2<S extends string> = S extends `${infer Line}\n${infer Rest}`
//   ? Solve2<Rest> extends infer RestSolved extends string[]
//     ? [Digits<Line>, ...RestSolved]
//     : never
//   : [];

// type Solved1 = LinesDigits<Lines<Input>>;
// type Solved = SumDigits<LinesDigits<Lines<Input>>>;

// type LineDigits<TLines extends string[]> = TLines extends [infer L extends string, ...infer Rest extends string[]] ? [Digits<L>, ...Solve<Rest>] : []

// type Solve<TDigits extends string[]> = TDigits extends [infer D extends string, ...infer Rest extends string[]] ? Add<D, Solve<Rest>> : 0;

// type Answer = Solve<Input>;
