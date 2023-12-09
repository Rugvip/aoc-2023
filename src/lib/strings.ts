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
}
