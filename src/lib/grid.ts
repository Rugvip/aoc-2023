import * as strings from './strings';
import * as array from './array';
import * as bool from './bool';
import * as int from './int';
import * as counter from './counter';
import * as tables from './tables';
import * as test from './test';
import * as vec2 from './vec2';

export type Grid<T> = T[][];

export type Parse<
  S extends string,
  TRows extends string[][] = [],
> = S extends `${infer ILine}\n${infer IRest}`
  ? Parse<IRest, [...TRows, strings.ToChars<ILine>]>
  : S extends ''
  ? TRows
  : [...TRows, strings.ToChars<S>];

export type Make<TItem, TWidth extends number, THeight extends number = TWidth> = array.Make<
  THeight,
  array.Make<TWidth, TItem>
>;

export type Iter = vec2.Vec2;

export type IterZero = vec2.Zero;
export type IterDone = vec2.Vec2<-1, -1>;
export type IterEnd<TGrid extends Grid<any>> = vec2.Vec2<
  tables.Dec[Width<TGrid>],
  tables.Dec[Height<TGrid>]
>;

export type IterNext<TGrid extends Grid<any>, TIter extends Iter> = TIter extends IterDone
  ? IterDone
  : tables.Inc[vec2.X<TIter>] extends infer INextX extends number
  ? INextX extends TGrid[0]['length']
    ? tables.Inc[vec2.Y<TIter>] extends infer INextY extends number
      ? INextY extends TGrid['length']
        ? IterDone
        : vec2.Vec2<0, INextY>
      : never
    : vec2.Vec2<INextX, vec2.Y<TIter>>
  : never;

export type Step<
  TDir extends vec2.Dir = vec2.Dir,
  TVec2 extends vec2.Vec2 = vec2.Vec2,
> = `${TDir}${TVec2}`;

export type StepPos<TStep extends Step> = TStep extends Step<any, infer IPos extends vec2.Vec2>
  ? IPos
  : never;
export type StepDir<TStep extends Step> = TStep extends Step<infer IDir extends vec2.Dir, any>
  ? IDir
  : never;

export type Vec2Set<TGrid extends Grid<any>, TIter extends Iter, TVal> = {
  [KY in keyof TGrid]: KY extends `${vec2.Y<TIter>}`
    ? TGrid[KY] extends infer IRow
      ? {
          [KX in keyof IRow]: KX extends `${vec2.X<TIter>}` ? TVal : IRow[KX];
        }
      : never
    : TGrid[KY];
};

export type Vec2Fill<
  TGrid extends Grid<any>,
  TA extends vec2.Vec2,
  TB extends vec2.Vec2,
  TVal,
> = Vec2Set<TGrid, vec2.UnionRange<TA, TB>, TVal>;

export type Vec2Map<
  TGrid extends Grid<any>,
  TIter extends Iter,
  TMap extends { [_ in any]: any },
> = TIter extends IterDone
  ? TGrid
  : TIter extends vec2.Vec2<infer IX, infer IY>
  ? {
      [KY in keyof TGrid]: KY extends `${IY}`
        ? TGrid[KY] extends infer IRow
          ? {
              [KX in keyof IRow]: KX extends `${IX}` ? TMap[IRow[KX] & keyof TMap] : IRow[KX];
            }
          : never
        : TGrid[KY];
    }
  : never;

export type TakeStep<TGrid extends Grid<any>, TStep extends Step> = TStep extends Step<
  infer IDir extends vec2.Dir,
  infer IPos extends vec2.Vec2
>
  ? Step<IDir, Vec2Step<TGrid, IPos, IDir>>
  : never;

export type Vec2Step<
  TGrid extends Grid<any>,
  TVec extends vec2.Vec2,
  TDir extends vec2.Dir,
> = vec2.X<TVec> extends infer IX extends number
  ? vec2.Y<TVec> extends infer IY extends number
    ? {
        '<': tables.Dec[IX] extends infer INextX extends number
          ? INextX extends -1
            ? never
            : vec2.Vec2<INextX, IY>
          : never;
        '>': IX extends -1
          ? vec2.Vec2<0, IY>
          : tables.Inc[IX] extends infer INextX extends number
          ? INextX extends Width<TGrid>
            ? never
            : vec2.Vec2<INextX, IY>
          : never;
        '^': tables.Dec[IY] extends infer INextY extends number
          ? INextY extends -1
            ? never
            : vec2.Vec2<IX, INextY>
          : never;
        v: IY extends -1
          ? vec2.Vec2<IX, 0>
          : tables.Inc[IY] extends infer INextY extends number
          ? INextY extends Height<TGrid>
            ? never
            : vec2.Vec2<IX, INextY>
          : never;
      }[TDir]
    : never
  : never;

export type AtVec2<
  TGrid extends Grid<any>,
  TVec extends vec2.Vec2,
> = TGrid[vec2.Y<TVec>][vec2.X<TVec>];

export type At<
  TGrid extends Grid<any>,
  TX extends number | string,
  TY extends number | string,
> = `${TX}` extends `${infer IX extends number}`
  ? `${TY}` extends `${infer IY extends number}`
    ? undefined extends TGrid[IY]
      ? undefined
      : TGrid[IY][IX]
    : never
  : never;

export type Width<TGrid extends Grid<any>> = TGrid[0]['length'];
export type Height<TGrid extends Grid<any>> = TGrid['length'];

export type RowAt<TGrid extends Grid<any>, TY extends number> = TGrid[TY];
export type ReverseRowAt<TGrid extends Grid<any>, TY extends number> = array.Reverse<TGrid[TY]>;
export type ColumnAt<TGrid extends Grid<any>, TX extends number> = {
  [K in keyof TGrid]: TGrid[K][TX];
};
export type ReverseColumnAt<TGrid extends Grid<any>, TX extends number> = int.Dec<
  TGrid['length']
> extends infer IHeightDec extends number
  ? {
      [Y in keyof TGrid]: TGrid[int.Subtract<IHeightDec, Y>][TX];
    }
  : never;

export type Count<
  TGrid extends Grid<any>,
  TItem,
  TIt extends Iter = IterZero,
  TCounter extends counter.Counter = counter.Zero,
> = TIt extends IterDone
  ? counter.Value<TCounter>
  : Count<
      TGrid,
      TItem,
      IterNext<TGrid, TIt>,
      [AtVec2<TGrid, TIt>] extends [TItem] ? counter.Inc<TCounter> : TCounter
    >;

export type Transpose<
  TGrid extends Grid<any>,
  TCounter extends counter.Counter = counter.Zero,
  TResult extends Grid<any> = [],
> = counter.Value<TCounter> extends Width<TGrid>
  ? TResult
  : Transpose<TGrid, counter.Inc<TCounter>, [...TResult, ColumnAt<TGrid, counter.Value<TCounter>>]>;

declare const testTranspose: test.Describe<
  test.Expect<Transpose<[]>, []>,
  test.Expect<Transpose<[[1, 2]]>, [[1], [2]]>,
  test.Expect<Transpose<[[1, 2], [3, 4]]>, [[1, 3], [2, 4]]>,
  test.Expect<Transpose<[[1, 2, 3], [4, 5, 6]]>, [[1, 4], [2, 5], [3, 6]]>
>;

export type Print<TGrid extends Grid<any>> = `[[\n${strings.Join<
  {
    [K in keyof TGrid]: `  ${strings.Join<TGrid[K]>}`;
  },
  '\n'
>}\n]]`;

export type RotateLeft<TGrid extends Grid<any>> = TGrid[0] extends infer IRow extends any[]
  ? int.Dec<Width<TGrid>> extends infer IWidthDec extends number
    ? {
        [Y in keyof IRow]: {
          [X in keyof TGrid]: TGrid[X][int.Subtract<IWidthDec, Y>];
        };
      }
    : never
  : [];

declare const testRotateLeft: test.Describe<
  test.Expect<RotateLeft<[]>, []>,
  test.Expect<RotateLeft<[[1, 2]]>, [[2], [1]]>,
  test.Expect<RotateLeft<[[1, 2], [3, 4]]>, [[2, 4], [1, 3]]>,
  test.Expect<RotateLeft<[[1, 2, 3], [4, 5, 6]]>, [[3, 6], [2, 5], [1, 4]]>
>;

export type RotateRight<TGrid extends Grid<any>> = TGrid[0] extends infer IRow extends any[]
  ? int.Dec<Height<TGrid>> extends infer IHeightDec extends number
    ? {
        [Y in keyof IRow]: {
          [X in keyof TGrid]: TGrid[int.Subtract<
            IHeightDec,
            X
          >] extends infer IThisRow extends any[]
            ? IThisRow[Y & keyof IThisRow]
            : never;
        };
      }
    : never
  : [];

declare const testRotateRight: test.Describe<
  test.Expect<RotateRight<[]>, []>,
  test.Expect<RotateRight<[[1, 2]]>, [[1], [2]]>,
  test.Expect<RotateRight<[[1, 2], [3, 4]]>, [[3, 1], [4, 2]]>,
  test.Expect<RotateRight<[[1, 2, 3], [4, 5, 6]]>, [[4, 1], [5, 2], [6, 3]]>
>;

export type Union<A extends Grid<any>, B extends Grid<any>> = A[0] extends infer IRow extends any[]
  ? {
      [Y in keyof A]: {
        [X in keyof IRow]: At<A, X, Y> | At<B, X, Y>;
      };
    }
  : never;

declare const testUnion: test.Describe<
  test.Expect<
    Union<[[0, 0, 0 | 1], [1, 1, 0 | 1]], [[0, 1, 0], [0, 1, 1 | 2]]>,
    [[0, 0 | 1, 0 | 1], [0 | 1, 1, 0 | 1 | 2]]
  >
>;

export type Intersection<
  A extends Grid<any>,
  B extends Grid<any>,
> = A[0] extends infer IRow extends any[]
  ? {
      [Y in keyof A]: {
        [X in keyof IRow]: At<A, X, Y> & At<B, X, Y>;
      };
    }
  : never;

declare const testIntersection: test.Describe<
  test.Expect<
    Intersection<[[0, 0, 0 | 1], [1, 1, 0 | 1]], [[0, 1, 0], [0, 1, 1 | 2]]>,
    [[0, never, 0], [never, 1, 1]]
  >
>;

export type And<A extends Grid<boolean>, B extends Grid<boolean>> = {
  [Y in keyof A]: A[Y] extends infer IARow extends boolean[]
    ? {
        [X in keyof IARow]: bool.And<IARow[X], At<B, X, Y>>;
      }
    : never;
};

declare const testAnd: test.Describe<
  test.Expect<
    And<[[false, false], [true, true]], [[false, true], [false, true]]>,
    [[false, false], [false, true]]
  >
>;

export type Or<A extends Grid<boolean>, B extends Grid<boolean>> = {
  [Y in keyof A]: A[Y] extends infer IARow extends boolean[]
    ? {
        [X in keyof IARow]: bool.Or<IARow[X], At<B, X, Y>>;
      }
    : never;
};

declare const testOr: test.Describe<
  test.Expect<
    Or<[[false, false], [true, true]], [[false, true], [false, true]]>,
    [[false, true], [true, true]]
  >
>;

export type Or4<
  A extends Grid<boolean>,
  B extends Grid<boolean>,
  C extends Grid<boolean>,
  D extends Grid<boolean>,
> = {
  [Y in keyof A]: A[Y] extends infer IARow extends boolean[]
    ? {
        [X in keyof IARow]: bool.Or<
          bool.Or<IARow[X], At<B, X, Y>>,
          bool.Or<At<C, X, Y>, At<D, X, Y>>
        >;
      }
    : never;
};

declare const testOr4: test.Describe<
  test.Expect<
    Or4<
      [[false, false], [false, true]],
      [[false, false], [true, false]],
      [[false, true], [false, false]],
      [[false, false], [false, false]]
    >,
    [[false, true], [true, true]]
  >
>;

export type Or5<
  A extends Grid<boolean>,
  B extends Grid<boolean>,
  C extends Grid<boolean>,
  D extends Grid<boolean>,
  E extends Grid<boolean>,
> = {
  [Y in keyof A]: A[Y] extends infer IARow extends boolean[]
    ? {
        [X in keyof IARow]: bool.Or<
          bool.Or<IARow[X], At<B, X, Y>>,
          bool.Or<At<C, X, Y>, bool.Or<At<D, X, Y>, At<E, X, Y>>>
        >;
      }
    : never;
};

declare const testOr5: test.Describe<
  test.Expect<
    Or5<
      [[true, false, false, false, false, false]],
      [[false, true, false, false, false, false]],
      [[false, false, true, false, false, false]],
      [[false, false, false, true, false, false]],
      [[false, false, false, false, true, false]]
    >,
    [[true, true, true, true, true, false]]
  >
>;

export type Xor<A extends Grid<boolean>, B extends Grid<boolean>> = {
  [Y in keyof A]: A[Y] extends infer IARow extends boolean[]
    ? {
        [X in keyof IARow]: bool.Xor<IARow[X], At<B, X, Y>>;
      }
    : never;
};

declare const testXor: test.Describe<
  test.Expect<
    Xor<[[false, false], [true, true]], [[false, true], [false, true]]>,
    [[false, true], [true, false]]
  >
>;

export type Shift<TDir extends vec2.Dir, TGrid extends Grid<any>> = {
  '<': {
    [Y in keyof TGrid]: TGrid[Y] extends [infer IFirst, ...infer IRow extends any[]]
      ? [...IRow, IFirst]
      : never;
  };
  '>': {
    [Y in keyof TGrid]: TGrid[Y] extends [...infer IRow extends any[], infer ILast]
      ? [ILast, ...IRow]
      : never;
  };
  '^': TGrid extends [infer IFirst extends any[], ...infer IRows extends any[][]]
    ? [...IRows, IFirst]
    : never;
  v: TGrid extends [...infer IRows extends any[][], infer ILast extends any[]]
    ? [ILast, ...IRows]
    : never;
}[TDir];
