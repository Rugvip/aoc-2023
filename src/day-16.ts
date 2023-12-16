import { Input } from '../input/16';
import { counter, grid, vec2 } from './lib';

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
  TEnergyGrid extends grid.Grid<'.' | Dir> = grid.Make<
    '.',
    grid.Width<TLensGrid>,
    grid.Height<TLensGrid>
  >,
  TSteps extends Step[] = [Step<vec2.Vec2<-1, 0>, '>'>],
> = TSteps extends [infer IStep extends Step, ...infer IRestSteps extends Step[]]
  ? IStep extends Step<infer IPos extends vec2.Vec2, infer IDir extends Dir>
    ? IDir extends grid.AtVec2<TEnergyGrid, IPos>
      ? StepGrid<TLensGrid, TEnergyGrid, IRestSteps>
      : NextStepsFrom<TLensGrid, IPos, IDir> extends infer INextSteps extends Step[]
      ? StepGrid<TLensGrid, grid.Vec2Set<TEnergyGrid, IPos, IDir>, [...INextSteps, ...IRestSteps]>
      : 7
    : 6
  : TEnergyGrid;

type ScoreGrid<
  TEnergyGrid extends grid.Grid<string>,
  TIter extends grid.Iter = grid.IterZero,
  TCounter extends counter.Counter = counter.Zero,
> = TIter extends grid.IterDone
  ? counter.Value<TCounter>
  : ScoreGrid<
      TEnergyGrid,
      grid.IterNext<TEnergyGrid, TIter>,
      '.' extends grid.AtVec2<TEnergyGrid, TIter> ? TCounter : counter.Inc<TCounter>
    >;

export declare const solution1: ScoreGrid<StepGrid<grid.Parse<Input>>>;
