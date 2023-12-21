export namespace bool {
  export type And<A extends boolean, B extends boolean> = A extends true
    ? B extends true
      ? true
      : false
    : false;

  export type Or<A extends boolean, B extends boolean> = A extends true
    ? true
    : B extends true
    ? true
    : false;

  export type Xor<A extends boolean, B extends boolean> = A extends true
    ? B extends true
      ? false
      : true
    : B extends true
    ? true
    : false;

  export type Not<A extends boolean> = A extends true ? false : true;
}
