import { Input } from '../input/15';
import { int, strings } from './lib';

type Input1 = `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7
`;

type ToAsciiTable = {
  '-': 45;
  '=': 61;
  '0': 48;
  '1': 49;
  '2': 50;
  '3': 51;
  '4': 52;
  '5': 53;
  '6': 54;
  '7': 55;
  '8': 56;
  '9': 57;
  a: 97;
  b: 98;
  c: 99;
  d: 100;
  e: 101;
  f: 102;
  g: 103;
  h: 104;
  i: 105;
  j: 106;
  k: 107;
  l: 108;
  m: 109;
  n: 110;
  o: 111;
  p: 112;
  q: 113;
  r: 114;
  s: 115;
  t: 116;
  u: 117;
  v: 118;
  w: 119;
  x: 120;
  y: 121;
  z: 122;
};

type ToAscii<S extends string> = ToAsciiTable[S & keyof ToAsciiTable];

type Hash<S extends string, THash extends number = 0> = S extends `${infer IHead}${infer IRest}`
  ? Hash<IRest, int.Divide<int.Multiply<int.Add<ToAscii<IHead>, THash>, 17>, 256>[1]>
  : THash;

type Solve<S extends string, TSum extends number = 0> = S extends `${infer IHead},${infer IRest}`
  ? Solve<IRest, int.Add<TSum, Hash<IHead>>>
  : int.Add<TSum, Hash<strings.TrimRight<S, '\n'>>>;

export declare const solution1: Solve<Input>;
