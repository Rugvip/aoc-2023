import { int } from './int';
import { test } from './test';
import { union } from './union';

export namespace vec2 {
  export type Vec2<X extends number = number, Y extends number = number> = `${X},${Y}`;

  export type X<TVec2 extends Vec2> = TVec2 extends `${infer IX extends number},${any}`
    ? IX
    : never;
  export type Y<TVec2 extends Vec2> = TVec2 extends `${any},${infer IY extends number}`
    ? IY
    : never;
  export type XY<TVec2 extends Vec2> =
    TVec2 extends `${infer IX extends number},${infer IY extends number}` ? [x: IX, y: IY] : never;

  export type Zero = Vec2<0, 0>;

  export type Dir = '^' | 'v' | '<' | '>';

  export type FlipDir<TDir extends Dir> = {
    '^': 'v';
    v: '^';
    '<': '>';
    '>': '<';
  }[TDir];

  export type Add<A extends Vec2, B extends Vec2> = A extends Vec2<infer AX, infer AY>
    ? B extends Vec2<infer BX, infer BY>
      ? Vec2<int.Add<AX, BX>, int.Add<AY, BY>>
      : never
    : never;

  declare const testAdd: test.Describe<
    test.Expect<Add<Zero, Zero>, Zero>,
    test.Expect<Add<Zero, Vec2<1, 1>>, Vec2<1, 1>>,
    test.Expect<Add<Zero, Vec2<1, 2>>, Vec2<1, 2>>,
    test.Expect<Add<Vec2<1, 2>, Vec2<3, 4>>, Vec2<4, 6>>,
    test.Expect<Add<Vec2<-1, -2>, Vec2<3, 4>>, Vec2<2, 2>>,
    test.Expect<Add<Vec2<1, 2>, Vec2<-3, -4>>, Vec2<-2, -2>>,
    test.Expect<Add<Vec2<-1, -2>, Vec2<-3, -4>>, Vec2<-4, -6>>,
    test.Expect<Add<Vec2<1000000, 1000000>, Vec2<9000000, 9000000>>, Vec2<10000000, 10000000>>
  >;

  export type ManhattanDistance<A extends Vec2, B extends Vec2> = A extends Vec2<infer AX, infer AY>
    ? B extends Vec2<infer BX, infer BY>
      ? int.Add<int.Abs<int.Subtract<AX, BX>>, int.Abs<int.Subtract<AY, BY>>>
      : never
    : never;

  declare const testManhattanDistance: test.Describe<
    test.Expect<ManhattanDistance<Zero, Zero>, 0>,
    test.Expect<ManhattanDistance<Zero, Vec2<1, 1>>, 2>,
    test.Expect<ManhattanDistance<Vec2<1, 2>, Vec2<4, 3>>, 4>,
    test.Expect<ManhattanDistance<Vec2<-1, -1>, Vec2<2, 3>>, 7>
  >;

  export type UnionRange<TA extends Vec2, TB extends Vec2> = Vec2<
    union.Range<X<TA>, X<TB>>,
    union.Range<Y<TA>, Y<TB>>
  >;

  declare const testUnionRange: test.Describe<
    test.Expect<UnionRange<Zero, Zero>, Zero>,
    test.Expect<UnionRange<Zero, Vec2<1, 1>>, Vec2<0 | 1, 0 | 1>>,
    test.Expect<UnionRange<Zero, Vec2<0, 2>>, Vec2<0, 0 | 1 | 2>>,
    test.Expect<UnionRange<Zero, Vec2<2, 0>>, Vec2<0 | 1 | 2, 0>>
  >;
}
