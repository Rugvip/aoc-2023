import { Expand } from './utils';
import { test } from './test';

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
      ? IRest extends `${infer IName}: ${infer IType extends VariableKind}}${infer INext}`
        ? [
            { type: 'literal'; value: TAcc },
            { type: 'variable'; name: IName; kind: IType },
            ...ParseTemplate<INext>,
          ]
        : ['bad variable']
      : ParseTemplate<IRest, `${TAcc}${IChar}`>
    : [{ type: 'literal'; value: TAcc }];

  type VariableKind = 'string' | 'number';
  type RepeaterKind = 'char' | 'line' | 'csv' | 'ssv';

  type ParsedTemplateLiteral = { type: 'literal'; value: string };
  type ParsedTemplateVariable = { type: 'variable'; name: string; kind: VariableKind };
  type ParsedTemplateRepeater = { type: 'repeater'; name: string; kind: RepeaterKind };

  type ParsedTemplateNode = ParsedTemplateLiteral | ParsedTemplateVariable | ParsedTemplateRepeater;

  type FirstPassResult = { [K in string]: any[] | any };

  type AppendResult<
    TResult extends FirstPassResult,
    TName extends string,
    TValue extends any,
  > = TName extends keyof TResult
    ? {
        [K in keyof TResult]: K extends TName ? [...TResult[K], TValue] : TResult[K];
      }
    : TResult & {
        [K in TName]: [TValue];
      };

  type SetResult<
    TResult extends FirstPassResult,
    TName extends string,
    TValue extends any,
  > = TName extends keyof TResult
    ? {
        [K in keyof TResult]: K extends TName ? TValue : TResult[K];
      }
    : TResult & {
        [K in TName]: TValue;
      };

  type RemainingTemplateToPattern<T extends ParsedTemplateNode[]> = T extends [
    infer INext extends ParsedTemplateNode,
    ...infer IRest extends ParsedTemplateNode[],
  ]
    ? INext extends { type: 'literal'; value: infer IValue extends string }
      ? `${IValue}${RemainingTemplateToPattern<IRest>}`
      : `${string}${RemainingTemplateToPattern<IRest>}`
    : '';

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
      : INode extends {
          type: 'variable';
          name: infer IName extends string;
          kind: infer IKind extends VariableKind;
        }
      ? S extends `${infer INextContent extends string}${RemainingTemplateToPattern<ITRest>}`
        ? S extends `${INextContent}${infer ISRest extends string}`
          ? {
              string: ApplyTemplate<ISRest, ITRest, SetResult<TResult, IName, INextContent>>;
              number: INextContent extends `${infer IN extends number}`
                ? ApplyTemplate<ISRest, ITRest, SetResult<TResult, IName, IN>>
                : never;
            }[IKind]
          : 3
        : 2
      : INode extends {
          type: 'repeater';
          name: infer IName extends string;
          kind: infer IKind extends RepeaterKind;
        }
      ? {
          char: S extends `${infer IChar}${infer ISRest}`
            ? IChar extends ' ' | '\n'
              ? ApplyTemplate<S, ITRest, TResult>
              : ApplyTemplate<ISRest, T, AppendResult<TResult, IName, IChar>>
            : ApplyTemplate<S, ITRest, TResult>;
          line: S extends `${infer ILine}\n${infer ISRest}`
            ? ApplyTemplate<ISRest, T, AppendResult<TResult, IName, ILine>>
            : ApplyTemplate<S, ITRest, TResult>;
          csv: 'no csv'; // TODO
          ssv: 'no ssv'; // TODO
        }[IKind]
      : never
    : TResult;

  type ApplyRefinement<
    TValues extends string[],
    TRefinement extends ParsedTemplateNode[],
  > = TValues extends [infer INext extends string, ...infer IRest extends string[]]
    ? [Expand<ApplyTemplate<INext, TRefinement>>, ...ApplyRefinement<IRest, TRefinement>]
    : [];

  type ApplyRefinements<
    TResult extends { [K in string]: string[] },
    TRefinements extends { [K in string]: string },
  > = {
    [K in keyof TResult]: K extends keyof TRefinements
      ? ParseTemplate<TRefinements[K]> extends infer IRefinement extends ParsedTemplateNode[]
        ? ApplyRefinement<TResult[K], IRefinement>
        : never
      : TResult[K];
  };

  export type Parse<
    S extends string,
    TTemplate extends string,
    TRefinements extends { [_ in string]: string } = {},
  > = ParseTemplate<TTemplate> extends infer ITemplate extends ParsedTemplateNode[]
    ? Expand<ApplyRefinements<ApplyTemplate<S, ITemplate>, TRefinements>>
    : 'parsed template is not a ParsedTemplate';
}

declare const testParser: test.Describe<
  test.Expect<
    parser.Parse<'a1b2c', 'a{a: number}b{b: number}c'>,
    {
      a: 1;
      b: 2;
    }
  >,
  test.Expect<
    parser.Parse<
      'a: 1\nb: 2\nc: 3\n',
      '[lines: line]',
      { lines: '{key: string}: {value: string}' }
    >,
    {
      lines: [{ key: 'a'; value: '1' }, { key: 'b'; value: '2' }, { key: 'c'; value: '3' }];
    }
  >
>;
