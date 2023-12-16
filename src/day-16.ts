import { Input } from '../input/16';
import { counter, grid, int, vec2 } from './lib';

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

type Dir = '^' | '>' | 'v' | '<';
type Cell = '|' | '-' | '\\' | '/';
type Step<TVec extends vec2.Vec2 = vec2.Vec2, TDir extends Dir = Dir> = `${TVec}:${TDir}`;

type NextStepsFrom<
  TLensGrid extends grid.Grid<'.' | Cell>,
  TPos extends vec2.Vec2,
  TDir extends Dir,
> = grid.Vec2Step<TLensGrid, TPos, TDir> extends infer INextPos extends vec2.Vec2
  ? [INextPos] extends [never]
    ? []
    : {
        '.': [Step<INextPos, TDir>];
        '|': TDir extends '^' | 'v'
          ? [Step<INextPos, TDir>]
          : [Step<INextPos, 'v'>, Step<INextPos, '^'>];
        '-': TDir extends '<' | '>'
          ? [Step<INextPos, TDir>]
          : [Step<INextPos, '>'>, Step<INextPos, '<'>];
        '\\': {
          '^': [Step<INextPos, '<'>];
          '>': [Step<INextPos, 'v'>];
          v: [Step<INextPos, '>'>];
          '<': [Step<INextPos, '^'>];
        }[TDir];
        '/': {
          '^': [Step<INextPos, '>'>];
          '>': [Step<INextPos, '^'>];
          v: [Step<INextPos, '<'>];
          '<': [Step<INextPos, 'v'>];
        }[TDir];
      }[grid.AtVec2<TLensGrid, INextPos>]
  : never;

type StepGrid<
  TLensGrid extends grid.Grid<'.' | Cell>,
  TStepQueue extends Step[],
  TEnergyGrid extends grid.Grid<Dir> = grid.Make<
    never,
    grid.Width<TLensGrid>,
    grid.Height<TLensGrid>
  >,
  TCurrentStep extends Step = never,
> = [TCurrentStep] extends [never]
  ? TStepQueue extends [infer IStep extends Step, ...infer IRestSteps extends Step[]]
    ? StepGrid<TLensGrid, IRestSteps, TEnergyGrid, IStep>
    : TEnergyGrid
  : TCurrentStep extends Step<infer IPos extends vec2.Vec2, infer IDir extends Dir>
  ? grid.AtVec2<TEnergyGrid, IPos> extends infer ICurrentEnergy extends Dir
    ? IDir extends ICurrentEnergy
      ? StepGrid<TLensGrid, TStepQueue, TEnergyGrid>
      : grid.Vec2Set<
          TEnergyGrid,
          IPos,
          ICurrentEnergy | IDir
        > extends infer INextEnergyGrid extends grid.Grid<Dir>
      ? NextStepsFrom<TLensGrid, IPos, IDir> extends [
          infer INextStep extends Step,
          ...infer INextSteps extends Step[],
        ]
        ? StepGrid<TLensGrid, [...TStepQueue, ...INextSteps], INextEnergyGrid, INextStep>
        : StepGrid<TLensGrid, TStepQueue, INextEnergyGrid>
      : never
    : never
  : never;

type ScoreGrid<
  TEnergyGrid extends grid.Grid<string>,
  TIter extends grid.Iter = grid.IterZero,
  TCounter extends counter.Counter = counter.Zero,
> = TIter extends grid.IterDone
  ? counter.Value<TCounter>
  : ScoreGrid<
      TEnergyGrid,
      grid.IterNext<TEnergyGrid, TIter>,
      [grid.AtVec2<TEnergyGrid, TIter>] extends [never] ? TCounter : counter.Inc<TCounter>
    >;

type MaxScore<TLensGrid extends grid.Grid<'.' | Cell>, TStartSteps extends Step[]> = {
  [I in keyof TStartSteps]: ScoreGrid<StepGrid<TLensGrid, [TStartSteps[I]]>>;
};

type PointsAroundAtOffset<TGrid extends grid.Grid<string>, TOffset extends number> = [
  Step<vec2.Vec2<TOffset, -1>, 'v'>,
  Step<vec2.Vec2<TOffset, grid.Height<TGrid>>, '^'>,
  Step<vec2.Vec2<-1, TOffset>, '>'>,
  Step<vec2.Vec2<grid.Width<TGrid>, TOffset>, '<'>,
];

type Parsed = grid.Parse<Input>;

export declare const solution1: ScoreGrid<StepGrid<Parsed, [Step<vec2.Vec2<-1, 0>, '>'>]>>;

// TODO: Finding the max here is currently a manual (and tedious) step.
export declare const solution2: int.Max<MaxScore<Parsed, PointsAroundAtOffset<Parsed, 69>>[number]>;
