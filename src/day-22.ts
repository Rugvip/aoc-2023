import { Input } from '../input/22';
import { array, counter, int, test, union } from './lib';

// type Input1 = `1,0,1~1,2,1
// 0,0,2~2,0,2
// 0,2,3~2,2,3
// 0,0,4~0,2,4
// 2,0,5~2,2,5
// 0,1,6~2,1,6
// 1,1,8~1,1,9
// `;

type Block<
  TX extends number = number,
  TY extends number = number,
  TZ extends number = number,
> = `${TX},${TY},${TZ}`;

type IdBlock<TId extends number = number, TBlock extends Block = Block> = [id: TId, block: TBlock];

type IdBlockId<T extends IdBlock> = T extends IdBlock<infer IId extends number, any> ? IId : never;
type IdBlockBlock<T extends IdBlock> = T extends IdBlock<any, infer IBlock extends Block>
  ? IBlock
  : never;

type BlockZ<T extends Block> = T extends Block<any, any, infer IZ extends number> ? IZ : never;

type ParseBlock<S extends string> =
  S extends `${infer AX extends number},${infer AY extends number},${infer AZ extends number}~${infer BX extends number},${infer BY extends number},${infer BZ extends number}`
    ? Block<union.Range<AX, BX>, union.Range<AY, BY>, union.Range<AZ, BZ>>
    : never;

type ParseBlocks<
  S extends string,
  TCounter extends counter.Counter = counter.Zero,
  UResult extends IdBlock = never,
> = S extends `${infer IBlock}\n${infer IRest}`
  ? ParseBlocks<
      IRest,
      counter.Inc<TCounter>,
      UResult | IdBlock<counter.Value<TCounter>, ParseBlock<IBlock>>
    >
  : UResult;

type BlockCount<
  S extends string,
  TCounter extends counter.Counter = counter.Zero,
> = S extends `${string}\n${infer IRest}`
  ? BlockCount<IRest, counter.Inc<TCounter>>
  : counter.Value<TCounter>;

type RemoveBlocksById<UBlock extends IdBlock, UId extends number> = [UId] extends [never]
  ? UBlock
  : UBlock extends IdBlock<UId, any>
  ? never
  : UBlock;

declare const testRemoveBlocksById: test.Describe<
  test.Expect<
    RemoveBlocksById<IdBlock<1, Block<1, 1, 1>> | IdBlock<2, Block<2, 2, 2>>, 1>,
    IdBlock<2, Block<2, 2, 2>>
  >,
  test.Expect<
    RemoveBlocksById<IdBlock<1, Block<1, 1, 1>> | IdBlock<2, Block<2, 2, 2>>, 1 | 2>,
    never
  >,
  test.Expect<
    RemoveBlocksById<IdBlock<1, Block<1, 1, 1>> | IdBlock<2, Block<2, 2, 2>>, 3>,
    IdBlock<1, Block<1, 1, 1>> | IdBlock<2, Block<2, 2, 2>>
  >,
  test.Expect<
    RemoveBlocksById<IdBlock<1, Block<1, 1, 1>> | IdBlock<2, Block<2, 2, 2>>, never>,
    IdBlock<1, Block<1, 1, 1>> | IdBlock<2, Block<2, 2, 2>>
  >
>;

type BlocksWithZ<UBlock extends IdBlock, TZ extends number> = UBlock extends any
  ? TZ extends BlockZ<IdBlockBlock<UBlock>>
    ? UBlock
    : never
  : never;

declare const testBlocksWithZ: test.Describe<
  test.Expect<
    BlocksWithZ<IdBlock<1, Block<2, 3, 4>> | IdBlock<5, Block<6, 7, 8>>, 4>,
    IdBlock<1, Block<2, 3, 4>>
  >,
  test.Expect<
    BlocksWithZ<IdBlock<1, Block<2, 3, 4>> | IdBlock<5, Block<6, 7, 8>>, 8>,
    IdBlock<5, Block<6, 7, 8>>
  >,
  test.Expect<
    BlocksWithZ<IdBlock<1, Block<2, 3, 4>> | IdBlock<5, Block<6, 7, 8>>, 4 | 8>,
    IdBlock<1, Block<2, 3, 4>> | IdBlock<5, Block<6, 7, 8>>
  >,
  test.Expect<BlocksWithZ<IdBlock<1, Block<2, 3, 4>> | IdBlock<5, Block<6, 7, 8>>, never>, never>,
  test.Expect<BlocksWithZ<IdBlock<1, Block<2, 3, 4>> | IdBlock<5, Block<6, 7, 8>>, 10>, never>
>;

type TrimTrailingNever<TArr extends any[]> = TArr extends [
  ...infer IRest extends any[],
  infer IHead,
]
  ? [IHead] extends [never]
    ? TrimTrailingNever<IRest>
    : TArr
  : never;

type BlocksByMinZ<
  UBlock extends IdBlock,
  TCounter extends counter.Counter = counter.Zero,
  TResult extends IdBlock[] = [],
> = counter.Value<TCounter> extends 350
  ? TrimTrailingNever<TResult>
  : BlocksWithZ<UBlock, counter.Value<TCounter>> extends infer ULevelBlock extends IdBlock
  ? BlocksByMinZ<
      RemoveBlocksById<UBlock, IdBlockId<ULevelBlock>>,
      counter.Inc<TCounter>,
      [...TResult, ULevelBlock]
    >
  : never;

type BlockOverlap<A extends Block, B extends Block> = [A & B] extends [never] ? false : true;

declare const testBlockOverlap: test.Describe<
  test.Expect<BlockOverlap<ParseBlock<'1,1,1~3,1,1'>, ParseBlock<'1,2,1~3,2,1'>>, false>,
  test.Expect<BlockOverlap<ParseBlock<'1,1,1~1,1,1'>, ParseBlock<'1,1,1~1,1,1'>>, true>,
  test.Expect<BlockOverlap<ParseBlock<'1,1,1~1,1,1'>, ParseBlock<'3,1,1~1,1,1'>>, true>
>;

type BlockDec<T extends Block> = [T] extends [
  Block<infer IX extends number, infer IY extends number, infer IZ extends number>,
]
  ? Block<IX, IY, int.Dec<IZ>>
  : never;

declare const testBlockDec: test.Describe<
  test.Expect<BlockDec<ParseBlock<'1,1,1~3,1,1'>>, ParseBlock<'1,1,0~3,1,0'>>,
  test.Expect<BlockDec<ParseBlock<'1,1,1~1,1,3'>>, ParseBlock<'1,1,0~1,1,2'>>,
  test.Expect<BlockDec<ParseBlock<'1,1,2~1,1,1'>>, ParseBlock<'1,1,1~1,1,0'>>
>;

type BlockInc<T extends Block> = [T] extends [
  Block<infer IX extends number, infer IY extends number, infer IZ extends number>,
]
  ? Block<IX, IY, int.Inc<IZ>>
  : never;

declare const testBlockInc: test.Describe<
  test.Expect<BlockInc<ParseBlock<'1,1,1~3,1,1'>>, ParseBlock<'1,1,2~3,1,2'>>,
  test.Expect<BlockInc<ParseBlock<'1,1,1~1,1,3'>>, ParseBlock<'1,1,2~1,1,4'>>,
  test.Expect<BlockInc<ParseBlock<'1,1,2~1,1,1'>>, ParseBlock<'1,1,3~1,1,2'>>
>;

type AboveBlock<T extends Block> = [T] extends [
  Block<infer IX extends number, infer IY extends number, infer IZ extends number>,
]
  ? Block<IX, IY, int.Inc<union.Max<IZ> & number>>
  : never;

type ApplyGravityImpl<
  TBlockByMinZ extends IdBlock[],
  UCollisionBlock extends Block = Block<union.Range<0, 10>, union.Range<0, 10>, 0>,
  UNextStatic extends IdBlock = never,
  TIt extends counter.Counter = counter.Make<1>,
  TResult extends IdBlock[] = [],
  TChanged extends boolean = false,
> = counter.Value<TIt> extends TBlockByMinZ['length']
  ? TChanged extends true
    ? ApplyGravityImpl<[...TResult, UNextStatic]>
    : TrimTrailingNever<TBlockByMinZ>
  : TBlockByMinZ[counter.Value<TIt>] extends infer UFallingBlock extends IdBlock
  ? (
      UFallingBlock extends any
        ? [BlockDec<IdBlockBlock<UFallingBlock>> & UCollisionBlock] extends [never]
          ? IdBlock<IdBlockId<UFallingBlock>, BlockDec<IdBlockBlock<UFallingBlock>>>
          : never
        : never
    ) extends infer UMovedBlock extends IdBlock
    ? RemoveBlocksById<
        UFallingBlock,
        IdBlockId<UMovedBlock>
      > extends infer UStaticBlock extends IdBlock
      ? ApplyGravityImpl<
          TBlockByMinZ,
          IdBlockBlock<
            BlocksWithZ<
              IdBlock<-1, UCollisionBlock> | UMovedBlock | UStaticBlock,
              counter.Value<TIt>
            >
          >,
          UStaticBlock,
          counter.Inc<TIt>,
          [...TResult, UNextStatic | UMovedBlock],
          [UMovedBlock] extends [never] ? TChanged : true
        >
      : never
    : never
  : never;

type ApplyGravity<UBlock extends IdBlock> = ApplyGravityImpl<BlocksByMinZ<UBlock>>;

type CollidingBlockIds<UBlock extends IdBlock, TTest extends Block> = UBlock extends any
  ? [IdBlockBlock<UBlock> & TTest] extends [never]
    ? never
    : IdBlockId<UBlock>
  : never;

declare const testCollisionBlockIds: test.Describe<
  test.Expect<
    CollidingBlockIds<
      IdBlock<1, ParseBlock<'1,1,1~1,1,3'>> | IdBlock<2, ParseBlock<'1,2,1~1,4,1'>>,
      ParseBlock<'2,1,1~1,1,1'>
    >,
    1
  >,
  test.Expect<
    CollidingBlockIds<
      IdBlock<1, ParseBlock<'1,1,1~1,1,3'>> | IdBlock<2, ParseBlock<'1,2,1~1,4,1'>>,
      ParseBlock<'2,1,7~1,1,7'>
    >,
    never
  >,
  test.Expect<
    CollidingBlockIds<
      IdBlock<1, ParseBlock<'1,1,1~1,1,3'>> | IdBlock<2, ParseBlock<'1,2,2~1,4,2'>>,
      ParseBlock<'1,1,2~1,3,2'>
    >,
    1 | 2
  >,
  test.Expect<CollidingBlockIds<never, ParseBlock<'1,1,2~1,3,2'>>, never>
>;

type UnionArrAdd<TArr extends any[], UEntry extends [index: number, value: any]> = {
  [KI in keyof TArr]:
    | TArr[KI]
    | (KI extends `${infer IN extends number}`
        ? UEntry extends any
          ? [IN, any] extends UEntry
            ? UEntry extends [any, infer IVal]
              ? IVal
              : never
            : never
          : never
        : never);
};

declare const testUnionArrAdd: test.Describe<
  test.Expect<UnionArrAdd<[never, never, 'c'], [1, 'a']>, [never, 'a', 'c']>,
  test.Expect<UnionArrAdd<[never, 'b', 'c'], [1, 'a']>, [never, 'a' | 'b', 'c']>,
  test.Expect<UnionArrAdd<[never, 'b', 'c'], [0, 'a'] | [1, 'a']>, ['a', 'a' | 'b', 'c']>,
  test.Expect<UnionArrAdd<[never, 'b', 'c'], [0 | 1, 'a']>, ['a', 'a' | 'b', 'c']>,
  test.Expect<UnionArrAdd<[never, never, 'c'], [1, 'a' | 'b']>, [never, 'a' | 'b', 'c']>,
  test.Expect<
    UnionArrAdd<[never, 'b', 'c'], [0 | 1, 'a'] | [1, 'd' | 'e']>,
    ['a', 'a' | 'b' | 'd' | 'e', 'c']
  >
>;

type SupportTables<
  TBlockByMinZ extends IdBlock[],
  TBlockCount extends number,
  TIt extends counter.Counter = counter.Zero,
  TSupporting extends number[] = array.Make<TBlockCount, never>,
  TSupported extends number[] = array.Make<TBlockCount, never>,
  TPairs extends [number, number][] = [],
> = counter.Value<TIt> extends TBlockByMinZ['length']
  ? { supporting: TSupporting; supportedBy: TSupported; pairs: TPairs }
  : (
      TBlockByMinZ[counter.Value<TIt>] extends infer UBlock extends IdBlock
        ? UBlock extends any
          ? AboveBlock<IdBlockBlock<UBlock>> extends infer IAbove extends Block
            ? CollidingBlockIds<
                TBlockByMinZ[BlockZ<IAbove>],
                IAbove
              > extends infer ISupportedId extends number
              ? [id: IdBlockId<UBlock>, supports: ISupportedId]
              : never
            : never
          : never
        : never
    ) extends infer USupportPair extends [id: number, supports: number]
  ? SupportTables<
      TBlockByMinZ,
      TBlockCount,
      counter.Inc<TIt>,
      UnionArrAdd<TSupporting, USupportPair>,
      UnionArrAdd<TSupported, USupportPair extends [infer A, infer B] ? [B, A] : never>,
      [...TPairs, USupportPair]
    >
  : never;

type CountRemovable<
  TSupporting extends number[],
  TSupportedBy extends number[],
  TIt extends counter.Counter = counter.For<TSupporting>,
  TRemovable extends counter.Counter = counter.Zero,
> = TIt extends counter.Done
  ? counter.Value<TRemovable>
  : CountRemovable<
      TSupporting,
      TSupportedBy,
      counter.Dec<TIt>,
      TSupporting[counter.Value<TIt>] extends infer USupporting extends number
        ? [USupporting] extends [never]
          ? counter.Inc<TRemovable>
          : (
              USupporting extends any
                ? HasOtherSupports<TSupportedBy, USupporting, counter.Value<TIt>>
                : never
            ) extends true
          ? counter.Inc<TRemovable>
          : TRemovable
        : never
    >;

type Solve1<TInput extends string> = SupportTables<
  ApplyGravity<ParseBlocks<TInput>>,
  BlockCount<TInput>
> extends {
  supporting: infer ISupporting extends number[];
  supportedBy: infer ISupportedBy extends number[];
}
  ? CountRemovable<ISupporting, ISupportedBy>
  : never;

export declare const solution1: Solve1<Input>;

type HasOtherSupports<
  TSupportedBy extends number[],
  TId extends number,
  UExclude extends number = never,
> = [Exclude<TSupportedBy[TId], TId | UExclude>] extends [never] ? false : true;

type FallingUnionSize<
  UFalling extends number,
  TIt extends counter.Counter,
  TCounter extends counter.Counter = counter.Zero,
> = TIt extends counter.Done
  ? counter.Value<TCounter>
  : FallingUnionSize<
      UFalling,
      counter.Dec<TIt>,
      counter.Value<TIt> extends UFalling ? counter.Inc<TCounter> : TCounter
    >;

type ExpandFalling<
  TSupporting extends number[],
  TSupportedBy extends number[],
  UFalling extends number,
> = TSupporting[UFalling] extends infer UFallingSupported extends number
  ? (
      UFallingSupported extends any
        ? HasOtherSupports<TSupportedBy, UFallingSupported, UFalling> extends false
          ? UFallingSupported
          : never
        : never
    ) extends infer UNextFalling extends number
    ? [Exclude<UNextFalling, UFalling>] extends [never]
      ? UFalling
      : ExpandFalling<TSupporting, TSupportedBy, UFalling | UNextFalling>
    : never
  : never;

type CountTotalFalling<
  TSupporting extends number[],
  TSupportedBy extends number[],
  TIt extends counter.Counter = counter.For<TSupporting>,
  TSum extends number = 0,
> = TIt extends counter.Done
  ? TSum
  : CountTotalFalling<
      TSupporting,
      TSupportedBy,
      counter.Dec<TIt>,
      int.Add<
        TSum,
        FallingUnionSize<
          Exclude<ExpandFalling<TSupporting, TSupportedBy, counter.Value<TIt>>, counter.Value<TIt>>,
          counter.For<TSupporting>
        >
      >
    >;

type Solve2<TInput extends string> = SupportTables<
  ApplyGravity<ParseBlocks<TInput>>,
  BlockCount<TInput>
> extends {
  supporting: infer ISupporting extends number[];
  supportedBy: infer ISupportedBy extends number[];
}
  ? CountTotalFalling<ISupporting, ISupportedBy>
  : never;

export declare const solution2: Solve2<Input>;
