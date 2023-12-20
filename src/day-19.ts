import { Input } from '../input/19';
import { int, utils } from './lib';

// type Input1 = `px{a<2006:qkq,m>2090:A,rfg}
// pv{a>1716:R,A}
// lnx{m>1548:A,A}
// rfg{s<537:gd,x>2440:R,A}
// qs{s>3448:A,lnx}
// qkq{x<1416:A,crn}
// crn{x>2662:A,R}
// in{s<1351:px,qqz}
// qqz{s>2770:qs,m<1801:hdj,R}
// gd{a>3333:R,R}
// hdj{m>838:A,pv}

// {x=787,m=2655,a=1222,s=2876}
// {x=1679,m=44,a=2067,s=496}
// {x=2036,m=264,a=79,s=2244}
// {x=2461,m=1339,a=466,s=291}
// {x=2127,m=1623,a=2188,s=1013}
// `;

type Cat = 'x' | 'm' | 'a' | 's';
type Op = '>' | '<';
type Condition<
  TCat extends Cat = Cat,
  TOp extends Op = Op,
  TValue extends number = number,
  TTarget extends string = string,
> = `${TCat}${TOp}${TValue}:${TTarget}`;
type Part<
  X extends number = number,
  M extends number = number,
  A extends number = number,
  S extends number = number,
> = `{x=${X},m=${M},a=${A},s=${S}}`;
type Result = 'A' | 'R';
type Workflow = [conditions: Condition[], defaultTarget: string];
type Workflows = { [name in string]: Workflow };

type ParseConditions<
  S extends string,
  TResult extends Condition[] = [],
> = S extends `${infer ICondition extends Condition},${infer IRest}`
  ? ParseConditions<IRest, [...TResult, ICondition]>
  : [conditions: TResult, defaultTarget: S];

type ParseWorkflows<
  S extends string,
  TResult extends Workflows = {},
> = S extends `${infer IName}{${infer IConditions}}\n${infer IRest}`
  ? ParseWorkflows<IRest, TResult & { [_ in IName]: ParseConditions<IConditions> }>
  : utils.Expand<TResult>;

type ParseParts<
  S extends string,
  TResult extends Part[] = [],
> = S extends `${infer IPart extends Part}\n${infer IRest}`
  ? ParseParts<IRest, [...TResult, IPart]>
  : TResult;

type Parse<S extends string> = S extends `${infer IWorkflows}\n\n${infer IParts}`
  ? [workflows: ParseWorkflows<`${IWorkflows}\n`>, parts: ParseParts<IParts>]
  : never;

type PartValue<TPart extends Part, TCat extends Cat> = TPart extends Part<
  infer IX extends number,
  infer IM extends number,
  infer IA extends number,
  infer IS extends number
>
  ? {
      x: IX;
      m: IM;
      a: IA;
      s: IS;
    }[TCat]
  : never;

type ApplyWorkflow<
  TConditions extends Condition[],
  TDefaultTarget extends string,
  TPart extends Part,
> = TConditions extends [
  Condition<
    infer TCat extends Cat,
    infer TOp extends Op,
    infer TValue extends number,
    infer TTarget extends string
  >,
  ...infer IRest extends Condition[],
]
  ? int.Compare<PartValue<TPart, TCat>, TValue> extends (TOp extends '<' ? 'lt' : 'gt')
    ? TTarget
    : ApplyWorkflow<IRest, TDefaultTarget, TPart>
  : TDefaultTarget;

type EvaluatePart<
  TWorkflows extends Workflows,
  TPart extends Part,
  TName extends string = 'in',
> = ApplyWorkflow<
  TWorkflows[TName][0],
  TWorkflows[TName][1],
  TPart
> extends infer IResult extends string
  ? IResult extends Result
    ? IResult
    : EvaluatePart<TWorkflows, TPart, IResult>
  : never;

type ScorePart<TPart extends Part> = TPart extends Part<
  infer X extends number,
  infer M extends number,
  infer A extends number,
  infer S extends number
>
  ? int.Add<int.Add<X, M>, int.Add<A, S>>
  : never;

type Solve1<
  TWorkflows extends Workflows,
  TParts extends Part[],
  TSum extends number = 0,
> = TParts extends [infer IPart extends Part, ...infer IRest extends Part[]]
  ? Solve1<
      TWorkflows,
      IRest,
      EvaluatePart<TWorkflows, IPart> extends 'A' ? int.Add<TSum, ScorePart<IPart>> : TSum
    >
  : TSum;

type Parsed = Parse<Input>;

export declare const solution1: Solve1<Parsed[0], Parsed[1]>;

type ConditionTreeNode = [cat: Cat, op: Op, value: number, yes: ConditionTree, no: ConditionTree];
type ConditionTree = ConditionTreeNode | Result;

type MakeConditionTreeConditions<
  TWorkflows extends Workflows,
  TConditions extends Condition[],
  TDefault extends string,
> = TConditions extends [
  Condition<
    infer ICat extends Cat,
    infer IOp extends Op,
    infer IValue extends number,
    infer ITarget extends string
  >,
  ...infer IRest extends Condition[],
]
  ? [
      cat: ICat,
      op: IOp,
      value: IValue,
      yes: MakeConditionTree<TWorkflows, ITarget>,
      no: MakeConditionTreeConditions<TWorkflows, IRest, TDefault>,
    ]
  : MakeConditionTree<TWorkflows, TDefault>;

type MakeConditionTree<
  TWorkflows extends Workflows,
  TName extends string = 'in',
> = TName extends Result
  ? TName
  : TWorkflows[TName] extends [
      conditions: infer IConditions extends Condition[],
      defaultTarget: infer IDefaultTarget extends string,
    ]
  ? MakeConditionTreeConditions<TWorkflows, IConditions, IDefaultTarget>
  : never;

type CompactConditionTree<TConditionTree extends ConditionTree> = TConditionTree extends Result
  ? TConditionTree
  : TConditionTree extends [
      infer ICat extends Cat,
      infer IOp extends Op,
      infer IValue extends number,
      infer IYes extends ConditionTree,
      infer INo extends ConditionTree,
    ]
  ? (
      IOp extends '>'
        ? [
            cat: ICat,
            op: '<',
            value: int.Inc<IValue>,
            yes: CompactConditionTree<INo>,
            no: CompactConditionTree<IYes>,
          ]
        : [
            cat: ICat,
            op: IOp,
            value: IValue,
            yes: CompactConditionTree<IYes>,
            no: CompactConditionTree<INo>,
          ]
    ) extends infer IResult extends ConditionTree
    ? IResult[3] extends IResult[4]
      ? IResult[3]
      : IResult
    : never
  : never;

type Range = [min: number, max: number];
type CatRanges = { [cat in Cat]: Range };

type RangeSpan<TRange extends Range> = int.Subtract<TRange[1], TRange[0]>;
type CatRangeProduct<TCatRanges extends CatRanges> = int.Multiply<
  int.Multiply<RangeSpan<TCatRanges['x']>, RangeSpan<TCatRanges['m']>>,
  int.Multiply<RangeSpan<TCatRanges['a']>, RangeSpan<TCatRanges['s']>>
>;

type Min<A extends number, B extends number> = int.Compare<A, B> extends 'lt' ? A : B;
type Max<A extends number, B extends number> = int.Compare<A, B> extends 'gt' ? A : B;

type FindApprovedConditionRanges<
  TConditionTree extends ConditionTree,
  TCurrentRange extends CatRanges = { [cat in Cat]: [min: 1, max: 4001] },
> = TConditionTree extends Result
  ? TConditionTree extends 'A'
    ? [TCurrentRange]
    : []
  : TConditionTree extends [
      infer ICat extends Cat,
      '<',
      infer IValue extends number,
      infer IYes extends ConditionTree,
      infer INo extends ConditionTree,
    ]
  ? [
      ...FindApprovedConditionRanges<
        IYes,
        {
          [K in keyof TCurrentRange]: K extends ICat
            ? [min: TCurrentRange[K][0], max: Min<IValue, TCurrentRange[K][1]>]
            : TCurrentRange[K];
        }
      >,
      ...FindApprovedConditionRanges<
        INo,
        {
          [K in keyof TCurrentRange]: K extends ICat
            ? [min: Max<IValue, TCurrentRange[K][0]>, max: TCurrentRange[K][1]]
            : TCurrentRange[K];
        }
      >,
    ]
  : never;

type SumRanges<TRanges extends CatRanges[], TSum extends number = 0> = TRanges extends [
  infer IRange extends CatRanges,
  ...infer IRest extends CatRanges[],
]
  ? SumRanges<IRest, int.Add<TSum, CatRangeProduct<IRange>>>
  : TSum;

export declare const solution2: SumRanges<
  FindApprovedConditionRanges<CompactConditionTree<MakeConditionTree<Parsed[0]>>>
>;
