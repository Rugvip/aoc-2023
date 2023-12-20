export namespace queue {
  type IncTable<TTable extends number[] = []> = TTable['length'] extends 100
    ? TTable
    : IncTable<[...TTable, [...TTable, any]['length']]>;
  type DecTable<TTable extends number[] = []> = TTable['length'] extends 100
    ? [0, ...TTable]
    : DecTable<[...TTable, TTable['length']]>;

  export type Queue = string | number | string[];

  export type Empty = '' | 0 | [];

  export type Pop<T extends Queue> = '' extends T
    ? (T extends string[] ? T : never) extends [
        infer IHead extends string,
        ...infer IRest extends string[],
      ]
      ? Pop<100 | IHead | IRest>
      : undefined
    : [
        head: T extends `${infer IHead};${string}` ? IHead : never,
        rest:
          | (T extends `${string};${infer IRest}` ? IRest : never)
          | DecTable[T extends number ? T : never]
          | (T extends string[] ? T : never),
      ];

  export type Push<T extends Queue, TItem extends string> = IncTable[T extends number
    ? T
    : never] extends infer INextCount extends number
    ? INextCount | `${T extends string ? T : never}${TItem};` | (T extends string[] ? T : never)
    : `${TItem};` | 1 | [T extends string ? T : never, ...(T extends string[] ? T : never)];
}
