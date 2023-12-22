import { Input } from '../input/22';
import { array, int } from './lib';

type Input1 = `1,0,1~1,2,1
0,0,2~2,0,2
0,2,3~2,2,3
0,0,4~0,2,4
2,0,5~2,2,5
0,1,6~2,1,6
1,1,8~1,1,9
`;

type Vec3<
  TX extends number = number,
  TY extends number = number,
  TZ extends number = number,
> = `${TX},${TY},${TZ}`;

type Vec3X<T extends Vec3> = T extends Vec3<infer I, any, any> ? I : never;
type Vec3Y<T extends Vec3> = T extends Vec3<any, infer I, any> ? I : never;
type Vec3Z<T extends Vec3> = T extends Vec3<any, any, infer I> ? I : never;

type Block<A extends Vec3 = Vec3, B extends Vec3 = Vec3> = `${A}~${B}`;
type BlockStart<T extends Block> = T extends Block<infer I extends Vec3, any> ? I : never;
type BlockEnd<T extends Block> = T extends Block<any, infer I extends Vec3> ? I : never;

type FindMaxZ<
  S extends string,
  TMax extends number = 0,
> = S extends `${infer IBlock extends Block}\n${infer IRest}`
  ? FindMaxZ<
      IRest,
      int.Compare<TMax, Vec3Z<BlockEnd<IBlock>>> extends 'lt' ? Vec3Z<BlockEnd<IBlock>> : TMax
    >
  : TMax;

type PopulateLevels<
  S extends string,
  T extends string[],
> = S extends `${infer IBlock extends Block}\n${infer IRest}`
  ? PopulateLevels<
      IRest,
      {
        [K in keyof T]: K extends `${Vec3Z<BlockStart<IBlock>>}` | `${Vec3Z<BlockEnd<IBlock>>}`
          ? `${T[K]}${IBlock};`
          : T[K];
      }
    >
  : T;

type Parse<S extends string> = PopulateLevels<S, array.Make<int.Inc<FindMaxZ<S>>, ''>>;

export declare const solution1: Parse<Input1>;
