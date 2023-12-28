import { Input } from '../input/23';
import { counter, int, grid, vec2, union } from './lib';

// type Input1 = `#.#####################
// #.......#########...###
// #######.#########.#.###
// ###.....#.>.>.###.#.###
// ###v#####.#v#.###.#.###
// ###.>...#.#.#.....#...#
// ###v###.#.#.#########.#
// ###...#.#.#.......#...#
// #####.#.#.#######.#.###
// #.....#.#.#.......#...#
// #.#####.#.#.#########v#
// #.#...#...#...###...>.#
// #.#.#v#######v###.###v#
// #...#.>.#...>.>.#.###.#
// #####v#.#.###v#.#.###.#
// #.....#...#...#.#.#...#
// #.#########.###.#.#.###
// #...###...#...#...#.###
// ###.###.#.###v#####v###
// #...#...#.#.>.>.#.>.###
// #.###.###.#.###.#.#v###
// #.....###...###...#...#
// #####################.#
// `;

type Parsed = grid.Parse<Input>;

type Cell = '.' | '#' | vec2.Dir;
type AllDirs = '^>v<';

type NextDirs<TDir extends vec2.Dir> = vec2.Dir extends infer IDir extends vec2.Dir
  ? IDir extends vec2.FlipDir<TDir>
    ? never
    : vec2.Dir
  : never;

type TryStep<
  TGrid extends grid.Grid<Cell>,
  TPos extends vec2.Vec2,
  TDir extends vec2.Dir,
> = grid.AtVec2<TGrid, TPos> extends infer ICell extends Cell
  ? ICell extends '#'
    ? false
    : ICell extends '.'
    ? true
    : TDir extends ICell
    ? true
    : false
  : never;

type CountSteps<
  TSteps extends string,
  TCounter extends counter.Counter = counter.Zero,
> = TSteps extends `${string};${infer IRest}`
  ? CountSteps<IRest, counter.Inc<TCounter>>
  : int.Subtract<counter.Value<TCounter>, 2>; // skip first step and trailing separator

type SlopeGridMaxPath<
  TGrid extends grid.Grid<Cell>,
  TEnd extends vec2.Vec2,
  TPrevDir extends vec2.Dir = 'v',
  TPos extends vec2.Vec2 = vec2.Vec2<1, 0>,
  TSteps extends string = ';1,0;',
> = TPos extends TEnd
  ? CountSteps<TSteps>
  : NextDirs<TPrevDir> extends infer INextDir extends vec2.Dir
  ? INextDir extends any
    ? grid.Vec2Step<TGrid, TPos, INextDir> extends infer INextPos extends vec2.Vec2
      ? TryStep<TGrid, INextPos, INextDir> extends true
        ? TSteps extends `${string};${INextPos};${string}`
          ? never
          : SlopeGridMaxPath<TGrid, TEnd, INextDir, INextPos, `${TSteps}${INextPos};`>
        : never
      : never
    : never
  : never;

type Solve1<TGrid extends grid.Grid<Cell>> = union.Max<
  SlopeGridMaxPath<
    TGrid,
    vec2.Vec2<int.Subtract<grid.Width<TGrid>, 2>, int.Dec<grid.Height<TGrid>>>
  >
>;

// export declare const solution1: Solve1<Parsed>

type NextSteps<
  TGrid extends grid.Grid<Cell>,
  TStep extends grid.Step,
  TDirs extends string = AllDirs,
> = TStep extends grid.Step<'^', vec2.Vec2<any, 0>>
  ? ''
  : TStep extends grid.Step<'v', vec2.Vec2<any, int.Dec<grid.Height<TGrid>>>>
  ? ''
  : TDirs extends `${infer IDir extends vec2.Dir}${infer IRestDirs}`
  ? IDir extends vec2.FlipDir<grid.StepDir<TStep>>
    ? NextSteps<TGrid, TStep, IRestDirs>
    : grid.Step<IDir, grid.StepPos<TStep>> extends infer IStep extends grid.Step
    ? grid.TakeStep<TGrid, IStep> extends infer INextStep extends grid.Step
      ? grid.AtVec2<TGrid, grid.StepPos<INextStep>> extends '#'
        ? NextSteps<TGrid, TStep, IRestDirs>
        : `${NextSteps<TGrid, TStep, IRestDirs>}${IStep};`
      : never
    : never
  : '';

type WalkUntilFork<
  TGrid extends grid.Grid<Cell>,
  TStep extends grid.Step,
  TCounter extends counter.Counter = counter.Zero,
> = NextSteps<TGrid, TStep> extends `${infer INextStep extends grid.Step};${infer IRest}`
  ? IRest extends ''
    ? WalkUntilFork<TGrid, grid.TakeStep<TGrid, INextStep>, counter.Inc<TCounter>>
    : [step: TStep, len: counter.Value<TCounter>]
  : [step: TStep, len: counter.Value<TCounter>];

type FindEdges<
  TGrid extends grid.Grid<Cell>,
  TQueue extends string = 'v1,0;',
  UVisited extends string = ';',
  TResult extends string = '',
> = TQueue extends `${infer IStep extends grid.Step};${infer IRestSteps}`
  ? WalkUntilFork<TGrid, grid.TakeStep<TGrid, IStep>> extends [
      step: infer INextStep extends grid.Step,
      len: infer INextLen extends number,
    ]
    ? UVisited extends `${string};${INextStep};${string}`
      ? FindEdges<TGrid, IRestSteps, UVisited, TResult>
      : FindEdges<
          TGrid,
          `${IRestSteps}${NextSteps<TGrid, INextStep>}`,
          `;${INextStep}${UVisited}`,
          `${TResult}${Edge<grid.StepPos<IStep>, grid.StepPos<INextStep>, int.Inc<INextLen>>};`
        >
    : never
  : TResult;

type IdGen = {
  ids: { [In in string]: string };
  chars: string;
};
type IdGenZero = { ids: {}; chars: 'ABCDEFGHIJKLMNOPQRSTUVXYZabcedfghijklmonpqrstuvxyz' };

type GenId<TName extends string, TGen extends IdGen> = TName extends keyof TGen['ids']
  ? [next: TGen, id: TGen['ids'][TName]]
  : TGen['chars'] extends `${infer IChar}${infer IRestChars}`
  ? [next: { chars: IRestChars; ids: TGen['ids'] & { [_ in TName]: IChar } }, id: IChar]
  : never;

type Edge<
  TFrom extends string = string,
  TTo extends string = string,
  TLen extends number = number,
> = `>${TFrom}-${TTo}#${TLen}`;

type RenameEdges<
  TEdges extends string,
  TGen extends IdGen = IdGenZero,
  TResult extends string = '',
> = TEdges extends `${Edge<infer IFrom, infer ITo, infer ILen>};${infer IRest}`
  ? GenId<IFrom, TGen> extends [infer IGen1 extends IdGen, infer IFromId extends string]
    ? GenId<ITo, IGen1> extends [infer IGen2 extends IdGen, infer IToId extends string]
      ? RenameEdges<IRest, IGen2, `${TResult}${Edge<IFromId, IToId, ILen>};`>
      : never
    : never
  : [gen: TGen, result: TResult];

type EdgeTo<
  TEdges extends string,
  TPos extends string,
> = TEdges extends `${infer IHead};${infer IRest}`
  ? IHead extends Edge<any, TPos, any>
    ? IHead
    : EdgeTo<IRest, TPos>
  : never;

type EzEdgesFrom<
  TEdges extends string,
  TPos extends string,
  TResult extends string = '|',
> = TEdges extends `${Edge<infer IFrom, infer ITo, infer ILen>};${infer IRest}`
  ? TPos extends ITo
    ? EzEdgesFrom<IRest, TPos, TResult>
    : TPos extends IFrom
    ? EzEdgesFrom<IRest, TPos, `${Edge<IFrom, ITo, ILen>};${TResult}`>
    : EzEdgesFrom<IRest, TPos, `${TResult}${Edge<IFrom, ITo, ILen>};`>
  : TResult;

type SumLens<
  TLens extends string,
  TSum extends number = 0,
> = TLens extends `${infer ILen extends number},${infer IRest}`
  ? SumLens<IRest, int.Add<TSum, ILen>>
  : TSum;

type MaxPathState<
  TNext extends string = string,
  TEdges extends string = string,
  TLens extends string = string,
> = `${TNext}/${TEdges}/${TLens}`;

type FindMaxPathExpand<
  TEnd extends string,
  TRestStates extends MaxPathState[],
  TRestEdges extends string,
  TNextEdges extends string,
  TLens extends string,
  TMax extends number,
  TCounter extends counter.Counter,
> = TNextEdges extends `${Edge<any, infer ITo, infer ILen>};${infer IRestNextEdges}`
  ? FindMaxPathExpand<
      TEnd,
      ITo extends TEnd
        ? TRestStates
        : [...TRestStates, MaxPathState<ITo, TRestEdges, `${TLens}${ILen},`>],
      TRestEdges,
      IRestNextEdges,
      TLens,
      ITo extends TEnd
        ? int.Compare<int.Add<SumLens<TLens>, ILen>, TMax> extends 'gt'
          ? int.Add<SumLens<TLens>, ILen>
          : TMax
        : TMax,
      TCounter
    >
  : FindMaxPath<TEnd, TRestStates, TMax, TCounter>;

type FindMaxPath<
  TEnd extends string,
  TStates extends MaxPathState[],
  TMax extends number = 0,
  /*
    This counter limits the search, but may stop it before the correct solution is found.
    It may need to be increased to find the correct solution, and it may also be needed
    to manually start the search with early edges in a different order.
    This is all because a full search of all possible paths takes a very long time, potentially several days.
    I'm not sure if this happens to work for all inputs or if it's just that I was lucky with mine.
    Either way as far as I can tell this is more or less the most efficient way to solve this and
    will find the correct solution given enough time and memory. The only tweak that may need to be done is to
    switch the state structure to a tuple instead of a template literal, since we'll otherwise hit the template literal limit.
    It's important that the search is depth first, or we'll quickly hit tuple size limits and just get back `any`.

    Some other things I tried:
      - Keeping track of visited nodes:
          This solution ends up doing that implicitly by trimming away edges that lead to nodes that we visit.
      - Removing the state queue:
          It's simpler, but we lose the tail call optimization and run into resource limits.
      - Lookup table for next edges:
          Only tried this with earlier solutions without the tail-call optimization.
          It's possible that this is faster, although since we have to keep track of visited nodes it
          inverts the search space complexity where the current solution will execute faster the closer
          to the leaves we are because we trim away inaccessible edges.
      - Using a template literal as a state queue:
          This is faster than using tuples but causes us to hit the template literal limit faster.
  */
  TCounter extends counter.Counter = counter.Make<500000>,
> = TCounter extends counter.Zero
  ? TMax
  : TStates extends [
      ...infer IRestStates extends MaxPathState[],
      MaxPathState<
        infer INext extends string,
        infer IEdges extends string,
        infer ILens extends string
      >,
    ]
  ? EzEdgesFrom<IEdges, INext> extends `${infer INextEdges}|${infer IRestEdges}`
    ? FindMaxPathExpand<
        TEnd,
        IRestStates,
        IRestEdges,
        INextEdges,
        ILens,
        TMax,
        counter.Dec<TCounter>
      >
    : never
  : TMax;

type Solve2<TGrid extends grid.Grid<Cell>> = RenameEdges<FindEdges<TGrid>> extends [
  gen: infer IGen extends IdGen,
  result: infer IEdges extends string,
]
  ? `${GenId<vec2.Vec2<1, 0>, IGen>[1]}|${GenId<
      vec2.Vec2<int.Subtract<grid.Width<Parsed>, 2>, int.Dec<grid.Height<Parsed>>>,
      IGen
    >[1]}` extends `${infer IStart}|${infer IEnd}`
    ? EdgeTo<IEdges, IEnd> extends Edge<infer ILastFrom, IEnd, infer ILastLen extends number>
      ? int.Add<FindMaxPath<ILastFrom, [MaxPathState<IStart, IEdges, ''>]>, ILastLen>
      : never
    : never
  : never;

export declare const solution2: Solve2<Parsed>;
