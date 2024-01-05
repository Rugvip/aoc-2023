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
| 17  | ⭐️ ⭐️ |
| 18  | ⭐️ ⭐️ |
| 19  | ⭐️ ⭐️ |
| 20  | ⭐️ ⭐️ |
| 21  | ⭐️ ⭐️ |
| 22  | ⭐️ ⭐️ |
| 23  | ⭐️ ⭐️ |
| 24  | ⭐️ ⭐️ |
| 25  | ⭐️ ⭐️ |

## Challenges

There are many properties of TypeScript compiler that makes it significantly more difficult to solve these challenges:

- There are no arithmetic operations of any kind, they all had to be implemented from scratch.
- It's slow compared to a regular language. A lot of problems that you can brute-force in other languages require more clever approaches upfront.
- The available data structures are limited, and they are all immutable. Many common operations on string, array and object operations are slow. All mutating object (hashmap) operations are excessively slow to the point of being unusable.
- Type instantiations are limited, you can't have more that `2^24` instances of any type since this is the maximum number of entries a JavaScript `Map` can hold. In particular you can't have too many different template literals (strings). For some of the more complex problems this means that you need to make sure you use a mix of different data structures in the solution, relying too much on any particular structure might cause you to hit this limit.
- The above also applies to conditionals - yep, you're limited in how many unique conditional statements you can have in certain situations.
- Unions are great and usually fast, but it's very costly to convert unions back to other data structures unless you have a limited search space. They're limited in how many items they can hold.
- Tuples are fairly fast as long as their size is static. After a couple of hundred items resizing starts becoming slow, and around a thousand it's too slow to use.

## Insights

These are a few things that I learned about how to best use the TypeScript type system to solve these challenges:

- Tail-call optimization should be used everywhere. All recursive types should use an accumulator.
- Template literals (strings) is the fastest data structure for most use cases. They're fast for integer arithmetic, queues, even faster than tuples for tuple-like things like storing vectors. They're however bad at applying operations to each element, and index lookups, where tuples are better.
- Objects are basically useless, they only situations where you want to use them is when you want to create a static lookup map that doesn't change and you can't use integer keys.
- The best way that I found to implement a mutable hashmap is to use a union of key-value tuples. Comparatively this structure is very fast at mutations, although care needs to be taken to make sure you don't exceed a couple of hundred or maybe thousand unique keys.
- Use unions where possible, but be prepared to refactor to use tuples or template literals if the union gets too big.
- Array (tuple) map operations using mapped object types are fast and powerful when working with fixed-size data. Although you can't apply any operations to the indices, since that will cause a conversion to a regular and very slow object.
