import { Input } from '../input/07';
import { int } from './lib/math';
import { UnionSize, ArrayIndices, Expand } from './lib/utils';
import { test } from './lib/test';

// type Input = `32T3K 765
// T55J5 684
// KK677 28
// KTJJT 220
// QQQJA 483
// `;

type OrderedCards = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
type Card = OrderedCards[number];

type CardValueMap = { [_ in Card]: number };
type DefaultCardValueMap = { [I in ArrayIndices<OrderedCards> as OrderedCards[I]]: I };

type Hand = [Card, Card, Card, Card, Card];
type Entry<THand extends Hand = Hand, TBid extends number = number> = { hand: THand; bid: TBid };

type ParseHand<S extends string> = S extends
  | `${infer ICard extends OrderedCards[number]}${infer IRest}`
  | `${infer ILastCard extends OrderedCards[number]}`
  ? [ICard & ILastCard, ...ParseHand<IRest>]
  : [];
type ParseEntry<S extends string> = S extends `${infer IHand} ${infer IBid extends number}`
  ? { hand: ParseHand<IHand>; bid: IBid }
  : never;

type ParseInput<S extends string> = S extends `${infer IEntry}\n${infer IRest}`
  ? [ParseEntry<IEntry>, ...ParseInput<IRest>]
  : [];

type MaxCardCount<THand extends Hand> = int.Max<
  { [I in ArrayIndices<THand> as THand[I]]: UnionSize<I> }[THand[number]]
>;

type Strength = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type HandStrength<THand extends Hand> = {
  1: 7; // five of a kind
  2: MaxCardCount<THand> extends 4 ? 6 /* four of a kind */ : 5 /* full house */;
  3: MaxCardCount<THand> extends 3 ? 4 /* three of a kind */ : 3 /* two pair */;
  4: 2; // one pair
  5: 1; // high card
}[UnionSize<THand[number]> & (1 | 2 | 3 | 4 | 5)];

type CompareCards<TA extends Card[], TB extends Card[], TCardValueMap extends CardValueMap> = [
  TA,
  TB,
] extends [
  [infer IA extends Card, ...infer IARest extends Card[]],
  [infer IB extends Card, ...infer IBRest extends Card[]],
]
  ? int.Compare<TCardValueMap[IA], TCardValueMap[IB]> extends infer IResult extends 'lt' | 'gt'
    ? IResult
    : CompareCards<IARest, IBRest, TCardValueMap>
  : 'eq';

declare const CompareCards: test.Describe<
  test.Expect<CompareCards<ParseHand<'23456'>, ParseHand<'23457'>, DefaultCardValueMap>, 'lt'>,
  test.Expect<CompareCards<ParseHand<'22222'>, ParseHand<'22223'>, DefaultCardValueMap>, 'lt'>,
  test.Expect<CompareCards<ParseHand<'3'>, ParseHand<'2'>, DefaultCardValueMap>, 'gt'>,
  test.Expect<CompareCards<ParseHand<'2'>, ParseHand<'2'>, DefaultCardValueMap>, 'eq'>,
  test.Expect<CompareCards<ParseHand<'2'>, ParseHand<'3'>, DefaultCardValueMap>, 'lt'>,
  test.Expect<CompareCards<ParseHand<'K'>, ParseHand<'Q'>, DefaultCardValueMap>, 'gt'>,
  test.Expect<CompareCards<ParseHand<'J'>, ParseHand<'Q'>, DefaultCardValueMap>, 'lt'>,
  test.Expect<CompareCards<ParseHand<'J'>, ParseHand<'T'>, DefaultCardValueMap>, 'gt'>,
  test.Expect<CompareCards<ParseHand<'23456'>, ParseHand<'23457'>, JokerCardValueMap>, 'lt'>,
  test.Expect<CompareCards<ParseHand<'22222'>, ParseHand<'22223'>, JokerCardValueMap>, 'lt'>,
  test.Expect<CompareCards<ParseHand<'J'>, ParseHand<'2'>, JokerCardValueMap>, 'lt'>,
  test.Expect<CompareCards<ParseHand<'2'>, ParseHand<'2'>, JokerCardValueMap>, 'eq'>,
  test.Expect<CompareCards<ParseHand<'K'>, ParseHand<'Q'>, JokerCardValueMap>, 'gt'>,
  test.Expect<CompareCards<ParseHand<'J'>, ParseHand<'Q'>, JokerCardValueMap>, 'lt'>,
  test.Expect<CompareCards<ParseHand<'J'>, ParseHand<'T'>, JokerCardValueMap>, 'lt'>
>;

type CompareHands<
  TA extends Hand,
  TB extends Hand,
  TCardValueMap extends CardValueMap = DefaultCardValueMap,
> = {
  lt: 'lt';
  eq: CompareCards<TA, TB, TCardValueMap>;
  gt: 'gt';
}[int.Compare<HandStrength<TA>, HandStrength<TB>>];

declare const testCompareHands: test.Describe<
  test.Expect<CompareHands<ParseHand<'23456'>, ParseHand<'23457'>>, 'lt'>,
  test.Expect<CompareHands<ParseHand<'22223'>, ParseHand<'23456'>>, 'gt'>,
  test.Expect<CompareHands<ParseHand<'22223'>, ParseHand<'22233'>>, 'gt'>,
  test.Expect<CompareHands<ParseHand<'44432'>, ParseHand<'44223'>>, 'gt'>,
  test.Expect<CompareHands<ParseHand<'55234'>, ParseHand<'44223'>>, 'lt'>,
  test.Expect<CompareHands<ParseHand<'A5432'>, ParseHand<'K5432'>>, 'gt'>,
  test.Expect<CompareHands<ParseHand<'Q5432'>, ParseHand<'K5432'>>, 'lt'>,
  test.Expect<CompareHands<ParseHand<'Q5432'>, ParseHand<'J5432'>>, 'gt'>,
  test.Expect<CompareHands<ParseHand<'95432'>, ParseHand<'J5432'>>, 'lt'>
>;

type InsertGroupedEntry<
  TEntries extends Entry[],
  TEntry extends Entry,
  TCardValueMap extends CardValueMap,
> = TEntries extends [infer IA extends Entry, ...infer IRest extends Entry[]]
  ? CompareCards<TEntry['hand'], IA['hand'], TCardValueMap> extends 'gt'
    ? [IA, ...InsertGroupedEntry<IRest, TEntry, TCardValueMap>]
    : [TEntry, ...TEntries]
  : [TEntry];

type SortGroupedEntries<
  TEntries extends Entry[],
  TCardValueMap extends CardValueMap,
  TResult extends Entry[] = [],
> = TEntries extends [infer IEntry extends Entry, ...infer IRest extends Entry[]]
  ? SortGroupedEntries<IRest, TCardValueMap, InsertGroupedEntry<TResult, IEntry, TCardValueMap>>
  : TResult;

type ScoreEntries<
  TEntries extends Entry[],
  TBase extends number = 0,
  TRankCounter extends any[] = [any],
> = TEntries extends [infer IEntry extends Entry, ...infer IRest extends Entry[]]
  ? int.Add<
      int.Multiply<IEntry['bid'], int.Add<TBase, TRankCounter['length']>>,
      ScoreEntries<IRest, TBase, [...TRankCounter, any]>
    >
  : 0;

type GroupEntiresByStrength<
  TEntries extends Entry[],
  TResult extends { [_ in Strength]: Entry[] } = { [_ in Strength]: [] },
> = TEntries extends [infer IEntry extends Entry, ...infer IRest extends Entry[]]
  ? GroupEntiresByStrength<
      IRest,
      {
        [S in Strength]: HandStrength<IEntry['hand']> extends S
          ? [...TResult[S], IEntry]
          : TResult[S];
      }
    >
  : TResult;

type SortEntryGroups<
  TGroups extends { [_ in Strength]: Entry[] },
  TCardValueMap extends CardValueMap,
> = {
  [S in Strength]: SortGroupedEntries<TGroups[S], TCardValueMap>;
};
type ScoreEntryGroups<
  TGroups extends { [_ in Strength]: Entry[] },
  TStrengthCounter extends any[] = [any],
  TBase extends number = 0,
  TResult extends number = 0,
> = TStrengthCounter['length'] extends infer S extends Strength
  ? ScoreEntryGroups<
      TGroups,
      [...TStrengthCounter, any],
      int.Add<TBase, TGroups[S]['length']>,
      int.Add<TResult, ScoreEntries<TGroups[S], TBase>>
    >
  : TResult;

export declare const solution1: ScoreEntryGroups<
  SortEntryGroups<GroupEntiresByStrength<ParseInput<Input>>, DefaultCardValueMap>
>;

type JokerCardValueMap = {
  [I in ArrayIndices<OrderedCards> as OrderedCards[I]]: OrderedCards[I] extends 'J' ? -1 : I;
};

type ExpandJokers<THand extends Card[]> = THand extends [
  infer ICard extends Card,
  ...infer IRest extends Card[],
]
  ? ICard extends 'J'
    ? Exclude<Card, 'J'> extends infer C extends Card
      ? C extends any
        ? [C, ...ExpandJokers<IRest>]
        : never
      : never
    : [ICard, ...ExpandJokers<IRest>]
  : [];

type JokerHandStrength<THand extends Hand> = int.Max<
  ExpandJokers<THand> extends infer J extends Hand
    ? J extends any
      ? HandStrength<J>
      : never
    : never
>;

type GroupJokerEntriesByStrength<
  TEntries extends Entry[],
  TResult extends { [_ in Strength]: Entry[] } = { [_ in Strength]: [] },
> = TEntries extends [infer IEntry extends Entry, ...infer IRest extends Entry[]]
  ? GroupJokerEntriesByStrength<
      IRest,
      {
        [S in Strength]: JokerHandStrength<IEntry['hand']> extends S
          ? [...TResult[S], IEntry]
          : TResult[S];
      }
    >
  : TResult;

export declare const solution2: ScoreEntryGroups<
  SortEntryGroups<GroupJokerEntriesByStrength<ParseInput<Input>>, JokerCardValueMap>
>;
