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
type Card = ArrayIndices<OrderedCards>;
type CardMap = { [I in Card as OrderedCards[I]]: I };

type Hand = [Card, Card, Card, Card, Card];
type Entry<THand extends Hand = Hand, TBid extends number = number> = { hand: THand; bid: TBid };

type ParseHand<S extends string> = S extends
  | `${infer ICard extends OrderedCards[number]}${infer IRest}`
  | `${infer ILastCard extends OrderedCards[number]}`
  ? [CardMap[ICard & ILastCard], ...ParseHand<IRest>]
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

type CompareCards<TA extends Card[], TB extends Card[]> = [TA, TB] extends [
  [infer IA extends Card, ...infer IARest extends Card[]],
  [infer IB extends Card, ...infer IBRest extends Card[]],
]
  ? int.Compare<IA, IB> extends infer IResult extends 'lt' | 'gt'
    ? IResult
    : CompareCards<IARest, IBRest>
  : 'eq';

type CompareHands<TA extends Hand, TB extends Hand> = {
  lt: 'lt';
  eq: CompareCards<TA, TB>;
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

type InsertEntry<TEntries extends Entry[], TEntry extends Entry> = TEntries extends [
  infer IA extends Entry,
  ...infer IRest extends Entry[],
]
  ? CompareHands<TEntry['hand'], IA['hand']> extends 'gt'
    ? [IA, ...InsertEntry<IRest, TEntry>]
    : [TEntry, ...TEntries]
  : [TEntry];

type SortEntries<TEntries extends Entry[], TResult extends Entry[] = []> = TEntries extends [
  infer IEntry extends Entry,
  ...infer IRest extends Entry[],
]
  ? SortEntries<IRest, InsertEntry<TResult, IEntry>>
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

type SortEntryGroups<TGroups extends { [_ in Strength]: Entry[] }> = {
  [S in Strength]: SortEntries<TGroups[S]>;
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
  SortEntryGroups<GroupEntiresByStrength<ParseInput<Input>>>
>;

export declare const solution2: any;
