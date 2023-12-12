export namespace strings {
  export type TrimRight<
    S extends string,
    TTrim extends string = ' ',
  > = S extends `${infer IRest}${TTrim}` ? TrimLeft<IRest, TTrim> : S;

  export type TrimLeft<
    S extends string,
    TTrim extends string = ' ',
  > = S extends `${TTrim}${infer IRest}` ? TrimLeft<IRest, TTrim> : S;

  export type Trim<S extends string, TTrim extends string = ' '> = TrimLeft<
    TrimRight<S, TTrim>,
    TTrim
  >;

  export type ToChars<
    S extends string,
    TArr extends string[] = [],
  > = S extends `${infer IChar}${infer IRest}` ? ToChars<IRest, [...TArr, IChar]> : TArr;

  export type ToNumber<S extends string> = S extends `${infer N extends number}` ? N : never;
}
