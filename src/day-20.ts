import { Input } from '../input/20';
import { array, counter, bigint, setmap, union } from './lib';

// type Input1 = `broadcaster -> aa, bb, cc
// %aa -> bb
// %bb -> cc
// %cc -> in
// &in -> aa
// `;

// type Input2 = `broadcaster -> aa
// %aa -> in, co
// &in -> bb
// %bb -> co
// &co -> ou
// `;

type NodeType = '%' | '&';
type Node<
  TName extends string = string,
  TType extends NodeType = NodeType,
  TTargets extends string = string,
  TState extends string = string,
> = [name: TName, type: TType, targets: TTargets, state: TState];

type HighPulse = '!';
type LowPulse = '.';

type SignalPulse = HighPulse | LowPulse;
type Signal<
  TPulse extends SignalPulse,
  TFrom extends string,
  TTo extends string,
> = `${TPulse}${TFrom}>${TTo};`;

type TargetsToSignals<
  TFrom extends string,
  TTargets extends string,
  TPulse extends SignalPulse = LowPulse,
  TSignals extends string = '',
> = TTargets extends `${infer ITarget},${infer IRest}`
  ? TargetsToSignals<TFrom, IRest, TPulse, `${TSignals}${Signal<TPulse, TFrom, ITarget>}`>
  : TSignals;

type ResolveInitialState<UNodes extends Node, TIncoming extends setmap.Map> = UNodes extends Node<
  infer IName extends string,
  infer IType extends NodeType,
  infer ITargets extends string,
  any
>
  ? Node<IName, IType, ITargets, IType extends '%' ? 'off' : setmap.Get<TIncoming, IName>>
  : never;

type NormalizeTargets<S extends string> = S extends `${infer ITarget}, ${infer IRest}`
  ? `${ITarget},${NormalizeTargets<IRest>}`
  : `${S},`;

type TargetsUnion<TTargets extends string> = TTargets extends `${infer ITarget},${infer IRest}`
  ? ITarget | TargetsUnion<IRest>
  : never;

type Parse<
  S extends string,
  TResult extends Node = never,
  TIncoming extends setmap.Map = setmap.Empty,
  TBroadcaster extends string = never,
> = S extends `${infer ILine}\n${infer IRest}`
  ? ILine extends `broadcaster -> ${infer ITargets}`
    ? Parse<IRest, TResult, TIncoming, NormalizeTargets<ITargets>>
    : ILine extends `${infer IType extends NodeType}${infer IName} -> ${infer ITargets}`
    ? Parse<
        IRest,
        TResult | Node<IName, IType, NormalizeTargets<ITargets>, ''>,
        setmap.BulkAdd<TIncoming, `${TargetsUnion<NormalizeTargets<ITargets>>}=${IName}`>,
        TBroadcaster
      >
    : never
  : {
      start: TargetsToSignals<'br', TBroadcaster>;
      nodes: ResolveInitialState<TResult, TIncoming>;
    };

type Flip<T extends string> = T extends 'off' ? 'on' : 'off';

type NewConjunctionState<
  UState extends string,
  TPulse extends SignalPulse,
  TFrom extends string,
> = TPulse extends LowPulse ? UState | TFrom : UState extends TFrom ? never : UState;

type HandleSignal<TNode extends Node, TPulse extends SignalPulse, TFrom extends string> = [
  TNode,
] extends [never]
  ? null
  : TNode extends Node<infer IName, infer IType extends NodeType, infer ITargets, infer IState>
  ? IType extends '%'
    ? TPulse extends HighPulse
      ? null
      : [
          signals: TargetsToSignals<IName, ITargets, IState extends 'off' ? HighPulse : LowPulse>,
          node: Node<IName, IType, ITargets, Flip<IState>>,
        ]
    : NewConjunctionState<IState, TPulse, TFrom> extends infer UNewState extends string
    ? [
        signals: TargetsToSignals<
          IName,
          ITargets,
          [UNewState] extends [never] ? LowPulse : HighPulse
        >,
        node: Node<IName, IType, ITargets, UNewState>,
      ]
    : never
  : never;

// type GetNode<UNode extends Node, TName extends string> = UNode & Node<TName>;
type GetNode<UNode extends Node, TName extends string> = UNode extends Node<TName, any, any, any>
  ? UNode
  : never;

type ToNode<UNode extends Node, TTarget extends string> = UNode extends Node<
  infer IName,
  any,
  `${string}${TTarget},${string}`,
  any
>
  ? IName
  : never;

type NodeName<TNode extends Node> = TNode extends Node<infer IName> ? IName : never;

type ReplaceNode<UNode extends Node, TNode extends Node> = UNode extends Node<NodeName<TNode>>
  ? TNode
  : UNode;

type ProcessSignals<
  UNodes extends Node,
  TSignals extends string,
  TStopAt extends string = never,
  TTotalCount extends counter.Counter = counter.Zero,
  THighCount extends counter.Counter = counter.Zero,
> = TSignals extends `${Signal<infer IPulse, infer IFrom, infer ITo>}${infer IRest}`
  ? `${IPulse}${ITo}` extends `${LowPulse}${TStopAt}`
    ? null
    : HandleSignal<GetNode<UNodes, ITo>, IPulse, IFrom> extends [
        signals: infer INewSignals extends string,
        node: infer INewNode extends Node,
      ]
    ? ProcessSignals<
        ReplaceNode<UNodes, INewNode>,
        `${IRest}${INewSignals}`,
        TStopAt,
        counter.Inc<TTotalCount>,
        IPulse extends HighPulse ? counter.Inc<THighCount> : THighCount
      >
    : ProcessSignals<
        UNodes,
        IRest,
        TStopAt,
        counter.Inc<TTotalCount>,
        IPulse extends HighPulse ? counter.Inc<THighCount> : THighCount
      >
  : [UNodes, TTotalCount, THighCount];

type BroadcastLoop<
  UNodes extends Node,
  TSignals extends string,
  TCounter extends counter.Counter = counter.Make<1000>,
  TTotalCount extends counter.Counter = counter.Zero,
  THighCount extends counter.Counter = counter.Zero,
> = TCounter extends counter.Zero
  ? [counter.Value<TTotalCount>, counter.Value<THighCount>]
  : ProcessSignals<UNodes, TSignals, never, TTotalCount, THighCount> extends [
      infer IUNodes extends Node,
      infer ITotalCount extends counter.Counter,
      infer IHighCount extends counter.Counter,
    ]
  ? BroadcastLoop<IUNodes, TSignals, counter.Dec<TCounter>, counter.Inc<ITotalCount>, IHighCount>
  : never;

type BroadcastUntil<
  UNodes extends Node,
  TSignals extends string,
  TUntil extends string,
  TCounter extends counter.Counter = counter.Zero,
> = ProcessSignals<UNodes, TSignals, TUntil> extends [infer IUNodes extends Node, any, any]
  ? BroadcastUntil<IUNodes, TSignals, TUntil, counter.Inc<TCounter>>
  : counter.Value<counter.Inc<TCounter>>;

type Solve1<TInput extends string> = BroadcastLoop<
  Parse<TInput>['nodes'],
  Parse<TInput>['start']
> extends [infer ITotalCount extends number, infer IHighCount extends number]
  ? bigint.Mul<bigint.Sub<ITotalCount, IHighCount>, IHighCount>
  : never;

type Solve2<TInput extends string> = Parse<TInput> extends {
  nodes: infer UNode extends Node;
  start: infer IStart extends string;
}
  ? array.Product<
      union.ToArray<
        ToNode<UNode, ToNode<UNode, 'rx'>> extends infer UInputNodeName extends string
          ? UInputNodeName extends any
            ? BroadcastUntil<UNode, IStart, UInputNodeName>
            : never
          : never
      >
    >
  : never;

export declare const solution1: Solve1<Input>;
export declare const solution2: Solve2<Input>;
