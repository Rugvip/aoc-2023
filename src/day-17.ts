import { Input } from '../input/17';
import { grid, vec2, bigint, counter, setmap } from './lib';

// type Input1 = `2413432311323
// 3215453535623
// 3255245654254
// 3446585845452
// 4546657867536
// 1438598798454
// 4457876987766
// 3637877979653
// 4654967986887
// 4564679986453
// 1224686865563
// 2546548887735
// 4322674655533
// `;

type CostGrid = grid.Grid<string>;

type StepSet = [string, string | number];
type StepSetEmpty = never;

type StepYSpread<U extends grid.Step, X extends string> = U extends `${'<' | '>'}${X},${infer IY}`
  ? IY
  : U extends `${any}${X},${infer IY extends number}`
  ? IY
  : never;

type StepSetAdd<TSet extends StepSet, U extends grid.Step> = [U] extends [never]
  ? TSet
  : [U] extends [`${any}${infer UX},${any}`]
  ?
      | (UX extends TSet[0]
          ? TSet extends [UX, infer UY]
            ? [UX, UY | StepYSpread<U, UX>]
            : never
          : [UX, StepYSpread<U, UX>])
      | (TSet extends [UX, any] ? never : TSet)
  : never;

type StepSetEntry<TStep extends grid.Step> = TStep extends `${'<' | '>'}${infer IX},${infer IY}`
  ? [IX, IY]
  : TStep extends `${any}${infer IX},${infer IY extends number}`
  ? [IX, IY]
  : never;

type Turns = {
  '^': '>';
  '>': 'v' | '^';
  v: '<' | '>';
  '<': 'v';
};

// Eliminate turn options that move more than 135 degrees away from the end
type ForbiddenTurns<TCostGrid extends CostGrid, TPos extends vec2.Vec2> = bigint.Compare<
  vec2.X<TPos>,
  vec2.Y<TPos>
> extends 'lt'
  ? bigint.Compare<bigint.Add<vec2.X<TPos>, vec2.Y<TPos>>, grid.Width<TCostGrid>> extends 'lt'
    ? '^' // left
    : '<' // down
  : bigint.Compare<bigint.Add<vec2.X<TPos>, vec2.Y<TPos>>, grid.Width<TCostGrid>> extends 'lt'
  ? '<' // up
  : '^'; // right;

type ShouldSkipRange<THalfSize extends string, N extends string> = bigint.Compare<
  bigint.Abs<bigint.Sub<N, THalfSize>>,
  bigint.Dec<bigint.Div<THalfSize, '2'>[0]>
> extends 'lt'
  ? true
  : false;

// Skip the high-cost centre of the grid
type ShouldSkipPos<
  TCostGrid extends CostGrid,
  TPos extends vec2.Vec2,
> = TPos extends `${infer IX},${infer IY}`
  ? ShouldSkipRange<bigint.Div<grid.Width<TCostGrid>, '2'>[0], IX> extends true
    ? ShouldSkipRange<bigint.Div<grid.Height<TCostGrid>, '2'>[0], IY>
    : false
  : never;

type NextPosInDir<
  TCostGrid extends CostGrid,
  TDir extends vec2.Dir,
  TPos extends vec2.Vec2,
  TCost extends string,
  TMinIt extends counter.Counter,
  TMaxIt extends counter.Counter,
> = ShouldSkipPos<TCostGrid, TPos> extends true
  ? never
  : TMaxIt extends counter.Zero
  ? never
  : grid.Vec2Step<TCostGrid, TPos, TDir> extends infer INextPos extends vec2.Vec2
  ? bigint.Add<TCost, grid.AtVec2<TCostGrid, INextPos>> extends infer INextCost extends string
    ? TMinIt extends counter.Zero
      ?
          | `${INextCost}=${INextPos}`
          | NextPosInDir<TCostGrid, TDir, INextPos, INextCost, TMinIt, counter.Dec<TMaxIt>>
      : NextPosInDir<TCostGrid, TDir, INextPos, INextCost, counter.Dec<TMinIt>, counter.Dec<TMaxIt>>
    : never
  : never;

type NextStepsTowardsDir<
  TCostGrid extends CostGrid,
  UStep extends grid.Step,
  TTargetDir extends vec2.Dir,
  TCost extends string,
  TMin extends number,
  TMax extends number,
> = UStep extends any
  ? Turns[grid.StepDir<UStep>] extends infer INextDir extends vec2.Dir
    ? INextDir extends TTargetDir
      ? INextDir extends ForbiddenTurns<TCostGrid, grid.StepPos<UStep>>
        ? never
        : NextPosInDir<
            TCostGrid,
            INextDir,
            grid.StepPos<UStep>,
            TCost,
            counter.Make<TMin>,
            counter.Make<TMax>
          >
      : never
    : never
  : never;

type Walk<
  TCostGrid extends CostGrid,
  TMin extends number,
  TMax extends number,
  TLimit extends counter.Counter = counter.Make<10000>,
  // Storing all future moves in a single map causes union overflow, so they're partitioned by direction
  TQUp extends setmap.Map = setmap.Empty,
  TQRight extends setmap.Map = setmap.BulkAdd<setmap.Empty, '0=0,0'>,
  TQDown extends setmap.Map = setmap.BulkAdd<setmap.Empty, '0=0,0'>,
  TQLeft extends setmap.Map = setmap.Empty,
  TCostIt extends counter.Counter = counter.Zero,
  TSeen extends StepSet = StepSetEmpty,
> = `${counter.Value<TCostIt>}` extends infer ICost extends string
  ? grid.IterEnd<TCostGrid> extends
      | setmap.Get<TQUp, ICost>
      | setmap.Get<TQRight, ICost>
      | setmap.Get<TQDown, ICost>
      | setmap.Get<TQLeft, ICost>
    ? counter.Value<TCostIt>
    : (

          | `^${setmap.Get<TQUp, ICost>}`
          | `>${setmap.Get<TQRight, ICost>}`
          | `v${setmap.Get<TQDown, ICost>}`
          | `<${setmap.Get<TQLeft, ICost>}` extends infer UStep extends grid.Step
          ? UStep extends any
            ? StepSetEntry<UStep> extends TSeen
              ? never
              : UStep
            : never
          : never
      ) extends infer UNextStep extends grid.Step
    ? Walk<
        TCostGrid,
        TMin,
        TMax,
        counter.Dec<TLimit>,
        setmap.BulkAdd<
          setmap.RemoveValues<
            setmap.Remove<TQUp, ICost>,
            UNextStep extends grid.Step<'^', infer IPos extends vec2.Vec2> ? IPos : never
          >,
          NextStepsTowardsDir<TCostGrid, UNextStep, '^', ICost, TMin, TMax>
        >,
        setmap.BulkAdd<
          setmap.RemoveValues<
            setmap.Remove<TQRight, ICost>,
            UNextStep extends grid.Step<'>', infer IPos extends vec2.Vec2> ? IPos : never
          >,
          NextStepsTowardsDir<TCostGrid, UNextStep, '>', ICost, TMin, TMax>
        >,
        setmap.BulkAdd<
          setmap.RemoveValues<
            setmap.Remove<TQDown, ICost>,
            UNextStep extends grid.Step<'v', infer IPos extends vec2.Vec2> ? IPos : never
          >,
          NextStepsTowardsDir<TCostGrid, UNextStep, 'v', ICost, TMin, TMax>
        >,
        setmap.BulkAdd<
          setmap.RemoveValues<
            setmap.Remove<TQLeft, ICost>,
            UNextStep extends grid.Step<'<', infer IPos extends vec2.Vec2> ? IPos : never
          >,
          NextStepsTowardsDir<TCostGrid, UNextStep, '<', ICost, TMin, TMax>
        >,
        counter.Inc<TCostIt>,
        StepSetAdd<TSeen, UNextStep>
      >
    : never
  : never;

export declare const solution1: Walk<grid.Parse<Input>, 0, 3>;
export declare const solution2: Walk<grid.Parse<Input>, 3, 10>;
