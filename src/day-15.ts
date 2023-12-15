import { Input } from '../input/15';
import { int, strings, array, test, counter } from './lib';

// type Input1 = `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7
// `;

type ToAsciiTable = {
  '-': 45;
  '=': 61;
  '0': 48;
  '1': 49;
  '2': 50;
  '3': 51;
  '4': 52;
  '5': 53;
  '6': 54;
  '7': 55;
  '8': 56;
  '9': 57;
  a: 97;
  b: 98;
  c: 99;
  d: 100;
  e: 101;
  f: 102;
  g: 103;
  h: 104;
  i: 105;
  j: 106;
  k: 107;
  l: 108;
  m: 109;
  n: 110;
  o: 111;
  p: 112;
  q: 113;
  r: 114;
  s: 115;
  t: 116;
  u: 117;
  v: 118;
  w: 119;
  x: 120;
  y: 121;
  z: 122;
};

type ToAscii<S extends string> = ToAsciiTable[S & keyof ToAsciiTable];

type Hash<S extends string, THash extends number = 0> = S extends `${infer IHead}${infer IRest}`
  ? Hash<IRest, int.Divide<int.Multiply<int.Add<ToAscii<IHead>, THash>, 17>, 256>[1]>
  : THash;

type Solve1<S extends string, TSum extends number = 0> = S extends `${infer IHead},${infer IRest}`
  ? Solve1<IRest, int.Add<TSum, Hash<IHead>>>
  : int.Add<TSum, Hash<strings.TrimRight<S, '\n'>>>;

export declare const solution1: Solve1<Input>;

type Entry<TKey extends string = string, TValue extends number = number> = TKey | TValue;
type Bucket = Entry[];

type BucketAdd<
  TEntries extends Entry[],
  TKey extends string,
  TValue extends number,
  TResult extends Bucket = [],
> = TEntries extends [infer IHead extends Entry, ...infer IRest extends Entry[]]
  ? TKey extends IHead
    ? [...TResult, Entry<TKey, TValue>, ...IRest]
    : BucketAdd<IRest, TKey, TValue, [...TResult, IHead]>
  : [...TResult, Entry<TKey, TValue>];

declare const testBucketAdd: test.Describe<
  test.Expect<BucketAdd<['a' | 1, 'b' | 2, 'c' | 3], 'a', 4>, ['a' | 4, 'b' | 2, 'c' | 3]>,
  test.Expect<BucketAdd<['a' | 1, 'b' | 2, 'c' | 3], 'b', 4>, ['a' | 1, 'b' | 4, 'c' | 3]>,
  test.Expect<BucketAdd<['a' | 1, 'b' | 2, 'c' | 3], 'c', 4>, ['a' | 1, 'b' | 2, 'c' | 4]>,
  test.Expect<BucketAdd<['a' | 1, 'b' | 2, 'c' | 3], 'd', 4>, ['a' | 1, 'b' | 2, 'c' | 3, 'd' | 4]>
>;

type BucketRemove<
  TEntries extends Entry[],
  TKey extends string,
  TResult extends Bucket = [],
> = TEntries extends [infer IHead extends Entry, ...infer IRest extends Entry[]]
  ? TKey extends IHead
    ? [...TResult, ...IRest]
    : BucketRemove<IRest, TKey, [...TResult, IHead]>
  : TResult;

declare const testBucketRemove: test.Describe<
  test.Expect<BucketRemove<['a' | 1, 'b' | 2, 'c' | 3], 'a'>, ['b' | 2, 'c' | 3]>,
  test.Expect<BucketRemove<['a' | 1, 'b' | 2, 'c' | 3], 'b'>, ['a' | 1, 'c' | 3]>,
  test.Expect<BucketRemove<['a' | 1, 'b' | 2, 'c' | 3], 'c'>, ['a' | 1, 'b' | 2]>,
  test.Expect<BucketRemove<['a' | 1, 'b' | 2, 'c' | 3], 'd'>, ['a' | 1, 'b' | 2, 'c' | 3]>
>;

type HashAdd<
  TMap extends Bucket[],
  TKey extends string,
  TValue extends number,
> = Hash<TKey> extends infer IKey extends number
  ? {
      [K in keyof TMap]: K extends `${IKey}` ? BucketAdd<TMap[K], TKey, TValue> : TMap[K];
    }
  : never;

type HashRemove<
  TMap extends Bucket[],
  TKey extends string,
> = Hash<TKey> extends infer IKey extends number
  ? {
      [K in keyof TMap]: K extends `${IKey}` ? BucketRemove<TMap[K], TKey> : TMap[K];
    }
  : never;

type ApplyOp<
  S extends string,
  TMap extends Bucket[],
> = S extends `${infer IKey}=${infer IValue extends number}`
  ? HashAdd<TMap, IKey, IValue>
  : S extends `${infer IKey}-`
  ? HashRemove<TMap, IKey>
  : never;

type ScoreBucket<
  TBucket extends Entry[],
  TCounter extends counter.Counter = counter.Inc<counter.Zero>,
  TSum extends number = 0,
> = TBucket extends [infer IHead extends Entry, ...infer IRest extends Entry[]]
  ? ScoreBucket<
      IRest,
      counter.Inc<TCounter>,
      int.Add<TSum, int.Multiply<IHead & number, counter.Value<TCounter>>>
    >
  : TSum;

type ScoreMap<
  TMap extends Bucket[],
  TCounter extends counter.Counter = counter.Inc<counter.Zero>,
  TSum extends number = 0,
> = TMap extends [infer IHead extends Bucket, ...infer IRest extends Bucket[]]
  ? ScoreMap<
      IRest,
      counter.Inc<TCounter>,
      int.Add<TSum, int.Multiply<ScoreBucket<IHead>, counter.Value<TCounter>>>
    >
  : TSum;

type Solve2<
  S extends string,
  TMap extends Bucket[] = array.Make<256, []>,
> = S extends `${infer IOp},${infer IRest}`
  ? Solve2<IRest, ApplyOp<IOp, TMap>>
  : ScoreMap<ApplyOp<strings.TrimRight<S, '\n'>, TMap>>;

export declare const solution2: Solve2<Input>;
