import { Input } from '../input/25';
import { int, union } from './lib';

// type Input1 = `jqt: rhn xhk nvd
// rsh: frs pzl lsr
// xhk: hfx
// cmg: qnr nvd lhk bvb
// rhn: xhk bvb hfx
// bvb: xhk hfx
// pzl: lsr hfx nvd
// qnr: nvd
// ntq: jqt hfx bvb xhk
// nvd: lhk
// lsr: lhk
// rzs: qnr cmg lsr rsh
// frs: qnr lhk lsr
// `;

type TargetsUnion<TTargets extends string> = TTargets extends `${infer ITarget} ${infer IRest}`
  ? ITarget | TargetsUnion<IRest>
  : TTargets;

type AllIds<
  TInput extends string,
  TResult extends string = never,
> = TInput extends `${infer IFrom}: ${infer ITargets}\n${infer IRest}`
  ? AllIds<IRest, IFrom | TargetsUnion<ITargets> | TResult>
  : TResult;

type Edges = { [_ in string]: string };

type EdgeUnions<
  TInput extends string,
  TEdges extends Edges = { [K in AllIds<TInput>]: never },
> = TInput extends `${infer IFrom}: ${infer ITargets}\n${infer IRest}`
  ? EdgeUnions<
      IRest,
      {
        [K in keyof TEdges]: K extends IFrom
          ? TEdges[K] | TargetsUnion<ITargets>
          : K extends TargetsUnion<ITargets>
          ? TEdges[K] | IFrom
          : TEdges[K];
      }
    >
  : TEdges;

type OrderedPair<A extends string, B extends string> = union.Head<
  keyof ({ [K in A]: B } & { [K in B]: A })
> extends infer IFirst extends string
  ? `${IFirst}/${Exclude<A | B, IFirst>}`
  : never;

type AllPairsExpand<
  TInput extends string,
  TFrom extends string,
  TTargets extends string,
  TResult extends string[],
> = TTargets extends `${infer ITarget} ${infer IRest}`
  ? AllPairsExpand<
      TInput,
      TFrom,
      IRest,
      OrderedPair<TFrom, ITarget> extends TResult[number]
        ? TResult
        : [...TResult, OrderedPair<TFrom, ITarget>]
    >
  : AllPairs<
      TInput,
      OrderedPair<TFrom, TTargets> extends TResult[number]
        ? TResult
        : [...TResult, OrderedPair<TFrom, TTargets>]
    >;

type AllPairs<
  TInput extends string,
  TResult extends string[] = [],
> = TInput extends `${infer IFrom}: ${infer ITargets}\n${infer IRest}`
  ? AllPairsExpand<IRest, IFrom, ITargets, TResult>
  : TResult;

type ExpandEdge<
  TEdgeUnions extends Edges,
  TFrom extends string,
  TExclude extends string,
  TDepth extends number,
> = TDepth extends 0
  ? TFrom
  : ExpandEdge<TEdgeUnions, Exclude<TEdgeUnions[TFrom], TExclude>, TExclude, int.Dec<TDepth>>;

type CanDisconnect<
  TEdgeUnions extends Edges,
  TEdge extends string,
  TDepth extends number,
> = TEdge extends `${infer ILeft}/${infer IRight}`
  ? [
      ExpandEdge<TEdgeUnions, ILeft, IRight, TDepth> &
        ExpandEdge<TEdgeUnions, IRight, ILeft, TDepth>,
    ] extends [never]
    ? true
    : false
  : never;

type FindDisconnectEdges<
  TEdges extends string[],
  TEdgeUnions extends Edges,
  TDepth extends number,
> = {
  [K in keyof TEdges]: CanDisconnect<TEdgeUnions, TEdges[K], TDepth> extends true
    ? TEdges[K]
    : never;
}[number];

type Disconnect<TEdges extends Edges, UEdges extends string> = {
  [K in keyof TEdges]: TEdges[K] extends infer ITo extends string
    ? ITo extends any
      ? [(`${K & string}/${ITo}` | `${ITo}/${K & string}`) & UEdges] extends [never]
        ? ITo
        : never
      : never
    : never;
};

type SizeGraph<
  TEdgeUnions extends Edges,
  TVisited extends string,
  TSum extends number = 1,
> = Exclude<TEdgeUnions[TVisited], TVisited> extends infer INew extends string
  ? [INew] extends [never]
    ? TSum
    : SizeGraph<TEdgeUnions, TEdgeUnions[TVisited] | TVisited, int.Add<TSum, union.Size<INew>>>
  : never;

type Solve<
  TInput extends string,
  TDepth extends number,
> = AllPairs<TInput> extends infer IEdges extends string[]
  ? EdgeUnions<TInput> extends infer IEdgeUnions extends Edges
    ? FindDisconnectEdges<IEdges, IEdgeUnions, TDepth> extends infer ISolutionEdges extends string
      ? union.Head<ISolutionEdges> extends `${infer IFirstLeft}/${infer IFirstRight}`
        ? int.Multiply<
            SizeGraph<Disconnect<IEdgeUnions, ISolutionEdges>, IFirstLeft>,
            SizeGraph<Disconnect<IEdgeUnions, ISolutionEdges>, IFirstRight>
          >
        : never
      : never
    : never
  : never;

export declare const solution1: Solve<Input, 4>;
