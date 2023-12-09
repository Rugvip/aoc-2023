import { utils } from './utils';
import { test } from './test';
import { objects } from './objects';
import { strings } from './strings';

export namespace parser {
  type ParseTemplate<
    S extends string,
    TAcc extends string = '',
  > = S extends `${infer IChar}${infer IRest}`
    ? IChar extends '['
      ? IRest extends `${infer IName}: ${infer IType extends RepeaterKind}]${infer INext}`
        ? [
            { type: 'literal'; value: TAcc },
            { type: 'repeater'; name: IName; kind: IType },
            ...ParseTemplate<INext>,
          ]
        : ['bad repeater']
      : IChar extends '{'
      ? IRest extends `${infer IContent extends string}}${infer INext}`
        ? IContent extends `${infer IName}: ${infer IType extends VariableKind}`
          ? [
              { type: 'literal'; value: TAcc },
              { type: 'variable'; name: IName; kind: IType },
              ...ParseTemplate<INext>,
            ]
          : [{ type: 'literal'; value: TAcc }, { type: 'wildcard' }, ...ParseTemplate<INext>]
        : never
      : ParseTemplate<IRest, `${TAcc}${IChar}`>
    : [{ type: 'literal'; value: TAcc }];

  type VariableKind = 'string' | 'number';
  type RepeaterKind = 'chars' | 'lines' | 'csv' | 'ssv' | 'numbers';

  type ParsedTemplateLiteral = { type: 'literal'; value: string };
  type ParsedTemplateWildcard = { type: 'wildcard' };
  type ParsedTemplateVariable = { type: 'variable'; name: string; kind: VariableKind };
  type ParsedTemplateRepeater = { type: 'repeater'; name: string; kind: RepeaterKind };

  type ParsedTemplateNode =
    | ParsedTemplateLiteral
    | ParsedTemplateWildcard
    | ParsedTemplateVariable
    | ParsedTemplateRepeater;

  type FirstPassResult = { [K in string]: any[] | any };

  type TemplateToPattern<T extends ParsedTemplateNode[]> = T extends [
    infer INext extends ParsedTemplateNode,
    ...infer IRest extends ParsedTemplateNode[],
  ]
    ? INext extends { type: 'literal'; value: infer IValue extends string }
      ? `${IValue}${TemplateToPattern<IRest>}`
      : `${string}${TemplateToPattern<IRest>}`
    : '';

  type SplitChars<S extends string> = S extends `${infer IChar}${infer IRest}`
    ? [IChar, ...SplitChars<IRest>]
    : [];
  type SplitLines<S extends string> =
    S extends `${infer IHead extends string}\n${infer IRest extends string}`
      ? [IHead, ...SplitLines<IRest>]
      : S extends ''
      ? []
      : [S];
  type SplitSpace<S extends string> = S extends `${infer IHead} ${infer IRest}`
    ? IHead extends ''
      ? SplitSpace<IRest>
      : [IHead, ...SplitSpace<IRest>]
    : [S];
  type SplitComma<S extends string> = S extends `${infer IHead},${infer IRest}`
    ? [strings.Trim<IHead>, ...SplitComma<IRest>]
    : [strings.Trim<S>];
  type ParseNumber<S extends string> = S extends `${infer INumber extends number}`
    ? INumber
    : never;
  type ParseNumbers<
    S extends string,
    TSeparator extends string = ' ' | ',' | '\n',
    TAcc extends string = '',
  > = S extends `${infer IChar}${infer IRest}`
    ? IChar extends TSeparator
      ? TAcc extends ''
        ? ParseNumbers<IRest, TSeparator>
        : [ParseNumber<strings.Trim<TAcc>>, ...ParseNumbers<IRest, TSeparator>]
      : ParseNumbers<IRest, TSeparator, `${TAcc}${IChar}`>
    : TAcc extends ''
    ? []
    : [ParseNumber<strings.Trim<TAcc>>];

  type ApplyTemplate<
    S extends string,
    T extends ParsedTemplateNode[],
    TResult extends FirstPassResult = {},
  > = T extends [
    infer INode extends ParsedTemplateNode,
    ...infer ITRest extends ParsedTemplateNode[],
  ]
    ? INode extends { type: 'literal'; value: infer IValue extends string }
      ? S extends `${IValue}${infer ISRest}`
        ? ApplyTemplate<ISRest, ITRest, TResult>
        : TResult
      : SplitContent<S, TemplateToPattern<ITRest>> extends [
          infer ISNext extends string,
          infer ISRest extends string,
        ]
      ? INode extends {
          type: 'variable';
          name: infer IName extends string;
          kind: infer IKind extends VariableKind;
        }
        ? {
            string: ApplyTemplate<ISRest, ITRest, objects.Set<TResult, IName, ISNext>>;
            number: ISNext extends `${infer IN extends number}`
              ? ApplyTemplate<ISRest, ITRest, objects.Set<TResult, IName, IN>>
              : never;
          }[IKind]
        : INode extends { type: 'wildcard' }
        ? ApplyTemplate<ISRest, ITRest, TResult>
        : INode extends {
            type: 'repeater';
            name: infer IName extends string;
            kind: infer IKind extends RepeaterKind;
          }
        ? {
            chars: ApplyTemplate<ISRest, ITRest, objects.Set<TResult, IName, SplitChars<ISNext>>>;
            lines: ApplyTemplate<ISRest, ITRest, objects.Set<TResult, IName, SplitLines<ISNext>>>;
            csv: ApplyTemplate<ISRest, ITRest, objects.Set<TResult, IName, SplitComma<ISNext>>>;
            ssv: ApplyTemplate<ISRest, ITRest, objects.Set<TResult, IName, SplitSpace<ISNext>>>;
            numbers: ApplyTemplate<
              ISRest,
              ITRest,
              objects.Set<TResult, IName, ParseNumbers<ISNext>>
            >;
          }[IKind]
        : never
      : never
    : TResult;

  type SplitContent<
    TContent extends string,
    TRestPattern extends string,
  > = string extends TRestPattern
    ? TContent
    : TContent extends `${infer IHead extends string}${TRestPattern}`
    ? TContent extends `${IHead}${infer ISRest extends string}`
      ? [next: IHead, rest: ISRest]
      : never
    : never;

  type ApplyRefinement<
    TValues extends string[],
    TRefinement extends ParsedTemplateNode[],
  > = TValues extends [infer INext extends string, ...infer IRest extends string[]]
    ? [utils.Expand<ApplyTemplate<INext, TRefinement>>, ...ApplyRefinement<IRest, TRefinement>]
    : [];

  type ApplyRefinementRepeater<
    TValues extends string[],
    IRepeater extends RepeaterKind,
  > = TValues extends [infer INext extends string, ...infer IRest extends string[]]
    ? [
        {
          chars: SplitChars<INext>;
          lines: SplitLines<INext>;
          csv: SplitComma<INext>;
          ssv: SplitSpace<INext>;
          numbers: ParseNumbers<INext>;
        }[IRepeater],
        ...ApplyRefinementRepeater<IRest, IRepeater>,
      ]
    : [];

  type ApplyRefinements<
    TResult extends { [K in string]: string[] },
    TRefinements extends { [K in string]: string },
  > = {
    [K in keyof TResult]: K extends keyof TRefinements
      ? TRefinements[K] extends `[${RepeaterKind}]`
        ? TRefinements[K] extends `[${infer IRepeater extends RepeaterKind}]`
          ? ApplyRefinementRepeater<TResult[K], IRepeater>
          : never
        : ParseTemplate<TRefinements[K]> extends infer IRefinement extends ParsedTemplateNode[]
        ? ApplyRefinement<TResult[K], IRefinement>
        : never
      : TResult[K];
  };

  export type Parse<
    S extends string,
    TTemplate extends string,
    TRefinements extends { [_ in string]: string } = {},
  > = ParseTemplate<TTemplate> extends infer ITemplate extends ParsedTemplateNode[]
    ? utils.Expand<ApplyRefinements<ApplyTemplate<S, ITemplate>, TRefinements>>
    : 'parsed template is not a ParsedTemplate';

  declare const testParser: test.Describe<
    test.Expect<
      Parse<'a1b2c', 'a{a: number}b{b: number}c'>,
      {
        a: 1;
        b: 2;
      }
    >,
    test.Expect<
      Parse<'a: 1\nb: 2\nc: 3\n', '[lines: lines]', { lines: '{key: string}: {value: string}' }>,
      {
        lines: [{ key: 'a'; value: '1' }, { key: 'b'; value: '2' }, { key: 'c'; value: '3' }];
      }
    >,
    test.Expect<
      Parse<'data: a, b,    c, d,e\ndata: a    b c  d', 'data: [comma: csv]\ndata: [space: ssv]'>,
      { comma: ['a', 'b', 'c', 'd', 'e']; space: ['a', 'b', 'c', 'd'] }
    >,
    test.Expect<
      Parse<'data: 1, 2, 3, 4, 5', 'data: [counts: numbers]'>,
      { counts: [1, 2, 3, 4, 5] }
    >,
    test.Expect<
      Parse<
        'Derp 1: 1, 2, 3\nDerp 2: 4 5    6\n',
        '[lines: lines]',
        { lines: 'Derp {number}: [counts: numbers]' }
      >,
      {
        lines: [{ counts: [1, 2, 3] }, { counts: [4, 5, 6] }];
      }
    >
  >;
}
