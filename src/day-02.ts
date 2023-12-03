import { Input } from '../input/02';

// type Input = `Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
// Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
// Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
// Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
// Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green
// `;

/*
In game 1, the game could have been played with as few as 4 red, 2 green, and 6 blue cubes. If any color had even one fewer cube, the game would have been impossible.
Game 2 could have been played with a minimum of 1 red, 3 green, and 4 blue cubes.
Game 3 must have been played with at least 20 red, 13 green, and 6 blue cubes.
Game 4 required at least 14 red, 3 green, and 15 blue cubes.
Game 5 needed no fewer than 6 red, 3 green, and 2 blue cubes in the bag.
*/

type Round = {
  green: number;
  red: number;
  blue: number;
};

type CubeColor = keyof Round;
type Game = { index: number; rounds: Round[] };

type ParseGames<TInput extends string> =
  TInput extends `${infer IGame}\n${infer IRest}`
    ? [ParseGame<IGame>, ...ParseGames<IRest>]
    : [];

type ParseGame<TLine extends string> =
  TLine extends `Game ${infer IIndex extends number}: ${infer IRoundsStr}`
    ? { index: IIndex; rounds: ParseRounds<IRoundsStr> }
    : never;

type ParseRounds<TRoundsStr extends string> =
  TRoundsStr extends `${infer IRound}; ${infer IRest}`
    ? [DefaultRound<ParseRound<IRound>>, ...ParseRounds<IRest>]
    : [DefaultRound<ParseRound<TRoundsStr>>];

type DefaultRound<TRound extends Partial<Round>> = TRound extends infer O
  ? { [K in CubeColor]: K extends keyof O ? O[K] : 0 }
  : never;

type ParseRound<TRoundStr extends string> =
  TRoundStr extends `${infer ICubes}, ${infer IRest}`
    ? ParseCubes<ICubes> & ParseRound<IRest>
    : ParseCubes<TRoundStr>;

type ParseCubes<TDieStr extends string> =
  TDieStr extends `${infer ICount extends number} ${infer IColor extends CubeColor}`
    ? { [_ in IColor]: ICount }
    : never;

type FilterRound<TRound extends Round, TLimits extends Round> = {
  [KColor in CubeColor]: LessThan<TLimits[KColor], TRound[KColor]> extends true
    ? false
    : true;
}[CubeColor] extends true
  ? true
  : false;

type FilterRounds<
  TRounds extends Round[],
  TLimits extends Round
> = TRounds extends [infer IRound extends Round, ...infer IRest extends Round[]]
  ? FilterRound<IRound, TLimits> extends false
    ? false
    : FilterRounds<IRest, TLimits>
  : true;

type FilterGame<TGame extends Game, TLimits extends Round> = FilterRounds<
  TGame['rounds'],
  TLimits
> extends true
  ? TGame
  : never;

type FilterGames<
  TGames extends Game[],
  TLimits extends Round
> = TGames extends [infer IGame extends Game, ...infer IRest extends Game[]]
  ? [FilterGame<IGame, TLimits>, ...FilterGames<IRest, TLimits>]
  : [];

type MakeTuple<N extends number, T extends 0[] = []> = T['length'] extends N
  ? T
  : MakeTuple<N, [...T, 0]>;

type LessThan<
  A extends number,
  B extends number,
  T extends any[] = []
> = T['length'] extends B
  ? false
  : T['length'] extends A
  ? true
  : LessThan<A, B, [...T, any]>;

type AllGames = ParseGames<Input>;

type PossibleGames = FilterGames<
  AllGames,
  {
    red: 12;
    green: 13;
    blue: 14;
  }
>;

type SumPossibleGames<
  TItems extends Game[],
  TResult extends any[] = []
> = TItems extends [infer IGame extends Game, ...infer IRest extends Game[]]
  ? [IGame] extends [never]
    ? SumPossibleGames<IRest, TResult>
    : SumPossibleGames<IRest, [...TResult, ...MakeTuple<IGame['index']>]>
  : TResult['length'];

export type Solution1 = SumPossibleGames<PossibleGames>;
