import { Input } from '../input/16';
import { counter, grid, int, queue, setmap, vec2 } from './lib';

// type Input1 = `.|...\\....
// |.-.\\.....
// .....|-...
// ........|.
// ..........
// .........\\
// ..../.\\\\..
// .-.-/..|..
// .|....-|.\\
// ..//.|....
// `;

type SplitCell = '|' | '-';
type ReflectCell = '/' | '\\';
type Cell = '.' | SplitCell | ReflectCell;

type NextStepsFrom<
  TLensGrid extends grid.Grid<'.' | Cell>,
  TStep extends grid.Step,
> = TStep extends grid.Step<infer IDir extends vec2.Dir, infer IPos extends vec2.Vec2>
  ? grid.Vec2Step<TLensGrid, IPos, IDir> extends infer INextPos extends vec2.Vec2
    ? [INextPos] extends [never]
      ? ''
      : {
          '.': `${grid.Step<IDir, INextPos>};`;
          '|': IDir extends '^' | 'v'
            ? `${grid.Step<IDir, INextPos>};`
            : `${grid.Step<'v', INextPos>};${grid.Step<'^', INextPos>};`;
          '-': IDir extends '<' | '>'
            ? `${grid.Step<IDir, INextPos>};`
            : `${grid.Step<'>', INextPos>};${grid.Step<'<', INextPos>};`;
          '\\': {
            '^': `${grid.Step<'<', INextPos>};`;
            '>': `${grid.Step<'v', INextPos>};`;
            v: `${grid.Step<'>', INextPos>};`;
            '<': `${grid.Step<'^', INextPos>};`;
          }[IDir];
          '/': {
            '^': `${grid.Step<'>', INextPos>};`;
            '>': `${grid.Step<'^', INextPos>};`;
            v: `${grid.Step<'<', INextPos>};`;
            '<': `${grid.Step<'v', INextPos>};`;
          }[IDir];
        }[grid.AtVec2<TLensGrid, INextPos>]
    : never
  : never;

type PushEach<
  TQueue extends queue.Queue,
  TSteps extends string,
> = TSteps extends `${infer IHead};${infer IRest}`
  ? PushEach<queue.Push<TQueue, IHead>, IRest>
  : TQueue;

type StepGridImpl<
  TLensGrid extends grid.Grid<'.' | Cell>,
  TStepQueue extends queue.Queue = queue.Empty,
  TSeen extends string = ';',
  TVisited extends string = ';',
  TCounter extends counter.Counter = counter.Zero,
> = queue.Pop<TStepQueue> extends [
  head: infer IHead extends grid.Step,
  rest: infer INextQueue extends queue.Queue,
]
  ? TSeen extends `${string};${IHead};${string}`
    ? StepGridImpl<TLensGrid, INextQueue, TSeen, TVisited, TCounter>
    : StepGridImpl<
        TLensGrid,
        PushEach<INextQueue, NextStepsFrom<TLensGrid, IHead>>,
        `${TSeen}${IHead};`,
        `${TVisited}${grid.StepPos<IHead>};`,
        TVisited extends `${string};${grid.StepPos<IHead>};${string}`
          ? TCounter
          : counter.Inc<TCounter>
      >
  : counter.Value<counter.Dec<TCounter>>;

type StepGrid<TLensGrid extends grid.Grid<'.' | Cell>, TStart extends grid.Step> = StepGridImpl<
  TLensGrid,
  queue.Push<queue.Empty, TStart>
>;

type Solve1<TInput extends string> = StepGrid<grid.Parse<TInput>, grid.Step<'>', vec2.Vec2<-1, 0>>>;

export declare const solution1: Solve1<Input>;

type StepsAroundAtOffset<TGrid extends grid.Grid<string>, TOffset extends number> = [
  grid.Step<'v', vec2.Vec2<TOffset, -1>>,
  grid.Step<'^', vec2.Vec2<TOffset, grid.Height<TGrid>>>,
  grid.Step<'>', vec2.Vec2<-1, TOffset>>,
  grid.Step<'<', vec2.Vec2<grid.Width<TGrid>, TOffset>>,
];

type AllStepsAround<
  TGrid extends grid.Grid<string>,
  TCounter extends counter.Counter = counter.For<TGrid>,
  TSteps extends grid.Step[] = [],
> = TCounter extends counter.Done
  ? TSteps
  : AllStepsAround<
      TGrid,
      counter.Dec<TCounter>,
      [...TSteps, ...StepsAroundAtOffset<TGrid, counter.Value<TCounter>>]
    >;

type AddVisited<TVisited extends setmap.Map, TStep extends grid.Step> = TStep extends grid.Step<
  any,
  vec2.Vec2<infer IX, infer IY>
>
  ? setmap.Add<TVisited, IX, IY>
  : never;

type TraceToSplit<
  TLensGrid extends grid.Grid<'.' | Cell>,
  TStart extends grid.Step,
  TStep extends grid.Step = TStart,
  TVisited extends setmap.Map = setmap.Empty,
> = NextStepsFrom<TLensGrid, TStep> extends `${infer IHead extends grid.Step};${infer IRest}`
  ? IRest extends `${infer IOther extends grid.Step};`
    ? [visited: AddVisited<TVisited, IHead>, split: `${IHead};${IOther};`]
    : IHead extends TStart
    ? [visited: TVisited, split: '']
    : TraceToSplit<TLensGrid, TStart, IHead, AddVisited<TVisited, IHead>>
  : [visited: TVisited, split: ''];

type Trace<TLensGrid extends grid.Grid<'.' | Cell>, TStep extends grid.Step> = TraceToSplit<
  TLensGrid,
  TStep
>;

type ValueSum<
  TMap extends setmap.Map,
  TIt extends counter.Counter = counter.Make<110>,
  TSum extends number = 0,
> = TIt extends counter.Done
  ? TSum
  : ValueSum<
      TMap,
      counter.Dec<TIt>,
      setmap.Get<TMap, counter.Value<TIt>> extends infer ISum extends number
        ? int.Add<TSum, ISum>
        : TSum
    >;

type UnionCount<
  U extends number,
  TIt extends counter.Counter = counter.Make<110>,
  TCounter extends counter.Counter = counter.Zero,
> = TIt extends counter.Done
  ? counter.Value<TCounter>
  : UnionCount<
      U,
      counter.Dec<TIt>,
      counter.Value<TIt> extends U ? counter.Inc<TCounter> : TCounter
    >;

type VisitedSum<TVisited extends setmap.Map> = setmap.Keys<TVisited> extends infer UKey
  ? ValueSum<UKey extends any ? [UKey, UnionCount<setmap.Get<TVisited, UKey>>] : never>
  : never;

type StepGridWithTracing<
  TLensGrid extends grid.Grid<'.' | Cell>,
  TStepQueue extends string = '',
  TSeen extends string = ';',
  TVisited extends setmap.Map = setmap.Empty,
> = TStepQueue extends `${infer IHead extends grid.Step};${infer INextQueue}`
  ? TSeen extends `${string};${IHead};${string}`
    ? StepGridWithTracing<TLensGrid, INextQueue, TSeen, TVisited>
    : Trace<TLensGrid, IHead> extends [
        infer IVisited extends setmap.Map,
        infer ISplit extends string,
      ]
    ? StepGridWithTracing<
        TLensGrid,
        `${ISplit}${INextQueue}`,
        `${TSeen}${IHead};`,
        TVisited | IVisited
      >
    : Trace<TLensGrid, IHead> extends [
        infer IVisited extends setmap.Map,
        infer ISplit extends string,
      ]
    ? StepGridWithTracing<TLensGrid, `${ISplit}${INextQueue}`, TSeen, TVisited | IVisited>
    : never
  : VisitedSum<setmap.UnionMerge<TVisited>>;

type Solve2Impl<
  TLensGrid extends grid.Grid<'.' | Cell>,
  TSteps extends grid.Step[],
  TIt extends counter.Counter = counter.For<TSteps>,
  TMax extends number = 0,
> = TIt extends counter.Done
  ? TMax
  : Solve2Impl<
      TLensGrid,
      TSteps,
      counter.Dec<TIt>,
      int.Max<StepGridWithTracing<TLensGrid, `${TSteps[counter.Value<TIt>]};`>, TMax>
    >;

type Solve2<TInput extends string> = Solve2Impl<
  grid.Parse<TInput>,
  AllStepsAround<grid.Parse<TInput>>
>;

export declare const solution2: Solve2<Input>;
