# Advent of Code 2023

My solutions for [Advent of Code 2023](https://adventofcode.com/2023) using the
[TypeScript type system](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html).

## What?

Yes! TypeScript has a really powerful type system that lets you do all kinds of
fun stuff! For example, this parses a string with a list of numbers separated by
space into an array:

```ts
type ParseNumbers<TInput extends string> =
  TInput extends `${infer INumber extends number} ${infer Rest}`
    ? [INumber, ...ParseNumbers<Rest>]
    : TInput extends `${infer INumber extends number}`
    ? [INumber]
    : [];

declare const input: ParseNumbers<'1 57 12 4'>; // [1, 57, 12, 4]
```

While the type system doesn't directly support arithmetic operations, they can
be implemented in other ways. For example, this is a naive implementation of
addition:

```ts
// Create a tuple of N items by recursively adding one item at a time until the length is N
type MakeCounter<N extends number, TResult extends any[] = []> = TResult['length'] extends N
  ? TResult
  : MakeCounter<N, [...TResult, any]>;

type Add<A extends number, B extends number> = [...MakeCounter<A>, ...MakeCounter<B>]['length'];

declare const result: Add<2, 3>; // 5
```

## Why?

A fun challenge! Please don't use any of this in production :)

## Setup

This project uses [Yarn](https://yarnpkg.com/) as a package manager so you'll
need to have that installed.

To install dependencies, run:

```sh
yarn install
```

This installs a patched version of TypeScript where type instantiation recursion
limits have been raised a bit :). Be sure to point your editor to this local
version of TypeScript if you want type hints.

As requested by the AoC organizers, the input files are not included in this
repository. Inputs should be placed in the [`input/`](./input) directory with
the name `<NN>.ts`, where `NN` is the 0-padded day number. For example, the
input for day 1 should be placed in `input/01.ts`.

Each input file should contain a single `Input` type export as follows:

```ts
export type Input = `<input>
`;
```

The `<input>` is the raw input string as provided by AoC with newlines intact.
There should **not** be a leading newline, and there should **always** be a
trailing newline.

For example, the example input for day 1 would look like this:

```ts
export type Input = `1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet
`;
```

## Usage

To print the output of a solution, run:

```sh
yarn run print <day>
```

For example, `yarn run print 4` prints the output of day 4.

## Progress

| Day | Stars   |
| --- | ------- |
| 1   | ⭐️ ⭐️ |
| 2   | ⭐️ ⭐️ |
| 3   | ⭐️ ⭐️ |
| 4   | ⭐️ ⭐️ |
| 5   | ⭐️ ⭐️ |
| 6   | ⭐️ ⭐️ |
| 7   | ⭐️ ⭐️ |
| 8   | ⭐️ ⭐️ |
| 9   | ⭐️ ⭐️ |
| 10  | ⭐️ ⭐️ |
| 11  | ⭐️ ⭐️ |
| 12  | ⭐️ ⭐️ |
| 13  | ⭐️ ⭐️ |
| 14  | ⭐️ ⭐️ |
| 15  | ⭐️ ⭐️ |
| 16  | ⭐️ ⭐️ |
| 17  |         |
| 18  |         |
| 19  | ⭐️ ⭐️ |
| 20  |         |
| 21  | ⭐️     |
| 22  |         |
| 23  | ⭐️ ⭐️ |
| 24  | ⭐️ ⭐️ |
| 25  | ⭐️     |
