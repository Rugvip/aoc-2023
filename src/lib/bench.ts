// import { int } from './int';
import { counter } from './counter';

type Bench<
  T extends string[] = [],
  C extends counter.Counter = counter.Make<1000>,
> = C extends counter.Zero
  ? T extends [...infer IRest extends string[], any]
    ? Bench<IRest, C>
    : 'done'
  : Bench<[...T, 'derp'], counter.Dec<C>>;
// type Bench<
//   T extends string = '',
//   C extends counter.Counter = counter.Make<20000>,
// > = C extends counter.Zero
//   ? T extends `${any};${infer IRest}`
//     ? Bench<IRest, C>
//     : 'done'
//   : Bench<`${T}derp;`, counter.Dec<C>>;

// type Bench<TA extends number = 0, TB extends number = 0> = TA extends 1000
//   ? 'done'
//   : TB extends 1000
//   ? Bench<int.Inc<TA>, 0>
//   : Bench<TA, int.Inc<TB>>;

// type Bench<N extends number = 1, TArr extends any[] = any[]> = N extends 300
//   ? TArr
//   : Bench<int.Inc<N>, array.Make<N>>;

// type Bench<
//   C extends counter.Counter = counter.Make<10000>,
//   N extends number = 0,
// > = C extends counter.Zero ? N : Bench<counter.Dec<C>, int.Inc<N>>;

export type b = Bench;
