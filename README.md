<h1 align="center">
  kiss-worker
</h1>
<p align="center">
  <a href="https://www.npmjs.com/package/kiss-worker">
    <img src="https://img.shields.io/npm/v/kiss-worker" alt="NPM Version">
  </a>
  <a href="https://github.com/andreashuber69/kiss-worker/releases">
    <img src="https://img.shields.io/github/release-date/andreashuber69/kiss-worker.svg" alt="Release Date">
  </a>
  <a href="https://github.com/andreashuber69/kiss-worker/actions/workflows/ci.yml">
    <img src="https://github.com/andreashuber69/kiss-worker/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://github.com/andreashuber69/kiss-worker/issues">
    <img src="https://img.shields.io/github/issues-raw/andreashuber69/kiss-worker.svg" alt="Issues">
  </a>
  <a href="https://codeclimate.com/github/andreashuber69/kiss-worker/maintainability">
    <img src="https://api.codeclimate.com/v1/badges/f3afec1c547d0c33bf94/maintainability" alt="Maintainability">
  </a>
  <a href="https://coveralls.io/github/andreashuber69/kiss-worker?branch=develop">
    <img src="https://coveralls.io/repos/github/andreashuber69/kiss-worker/badge.svg?branch=develop" alt="Coverage">
  </a>
  <a href="https://www.npmjs.com/package/kiss-worker?activeTab=code">
    <img src="https://img.shields.io/bundlephobia/minzip/kiss-worker" alt="npm Bundle Size">
  </a>
  <a href="https://github.com/andreashuber69/kiss-worker/blob/develop/LICENSE">
    <img src="https://img.shields.io/github/license/andreashuber69/kiss-worker.svg" alt="License">
  </a>
</p>

Provides one of the easiest ways to use a worker thread in the browser, in just ~2kB of additional chunk size!

1. [Features](#features)
1. [Prerequisites](#prerequisites)
1. [Getting Started](#getting-started)
   - [Installation](#installation)
   - [Example 1: Single Function](#example-1-single-function)
   - [Example 2: Object](#example-2-object)
1. [Motivation](#motivation)
   - [Web Workers are Surprisingly Hard to Use](#web-workers-are-surprisingly-hard-to-use)
   - [Requirements for a Better Interface](#requirements-for-a-better-interface)

## Features

- Full [TypeScript](https://typescriptlang.org) support with the best achievable type safety for all client code
- Fully transparent marshalling of arguments, return values **and** `Error` objects
- Sequentialization of simultaneous calls with a FIFO queue
- Support for synchronous and asynchronous functions and methods
- Automated tests for 99% of the code
- Reporting of incorrectly implemented functions and methods

## Prerequisites

This is an ESM-only package. If you're still targeting browsers without ESM support, this package is not for you.

## Getting Started

### Installation

`npm install kiss-worker`

### Example 1: Single Function

The full code of this example can be found on [GitHub](https://github.com/andreashuber69/kiss-worker-demo1) and
[StackBlitz](https://stackblitz.com/~/github.com/andreashuber69/kiss-worker-demo1).

```ts
// ./src/createFibonacciWorker.ts
import { implementFunctionWorker } from "kiss-worker";

// The function we want to execute on a worker thread
const fibonacci = (n: number): number =>
    ((n < 2) ? Math.floor(n) : fibonacci(n - 1) + fibonacci(n - 2));

export const createFibonacciWorker = implementFunctionWorker(
    // A function that creates a web worker running this script
    () => new Worker(
        new URL("createFibonacciWorker.js", import.meta.url),
        { type: "module" },
    ),
    fibonacci,
);
```

That's it, we've defined our worker with a single statement! Let's see how we can use this from *main.ts*:

```ts
// ./src/main.ts
import { createFibonacciWorker } from "./createFibonacciWorker.ts";

// Start a new worker thread waiting for work.
const worker = createFibonacciWorker();

// Send the argument (40) to the worker thread, where it will be passed
// to our function. In the mean time we're awaiting the returned promise,
// which will eventually fulfill with the result calculated on the worker
// thread.
const result = await worker.execute(40);

const element = document.querySelector("h1");

if (element) {
    element.textContent = `${result}`;
}
```

Here are a few facts that might not be immediately obvious:

- Each call to `createFibonacciWorker()` starts a new and independent worker thread. If necessary, a thread could be
  terminated by calling `worker.terminate()`.
- The signature of `worker.execute()` is equivalent to the one of `fibonacci()`. Of course, `Error`s thrown by
  `fibonacci()` would also be rethrown by `worker.execute()`. The only difference is that `worker.execute()` is
  asynchronous, while `fibonacci()` is synchronous.
- All involved code is based on ECMAScript modules (ESM), which is why we must pass `{ type: "module" }` to the `Worker`
  constructor. This allows us to use normal `import` statements in *./src/createFibonacciWorker.ts* (as opposed to
  `importScripts()` required inside classic workers).
- *./src/createFibonacciWorker.ts* is imported by code running on the main thread **and** is also the entry point for
  the worker thread. This is possible because `implementFunctionWorker()` detects on which thread it is run. However,
  this detection would **not** work correctly, if code in a worker thread attempted to start another worker thread. This
  can easily be fixed, as we will see later.

### Example 2: Object

The full code of this example can be found on [GitHub](https://github.com/andreashuber69/kiss-worker-demo2) and
[StackBlitz](https://stackblitz.com/~/github.com/andreashuber69/kiss-worker-demo2).

Sometimes it's not enough to serve just a single function on a worker thread, which is why this library also supports
serving objects:

```ts
// ./src/createCalculatorWorker.ts
import { implementObjectWorker } from "kiss-worker";

// We want to serve an object of this class on a worker thread
class Calculator {
    public multiply(left: bigint, right: bigint) {
        return left * right;
    }

    public divide(left: bigint, right: bigint) {
        return left / right;
    }
}

export const createCalculatorWorker = implementObjectWorker(
    // A function that creates a web worker running this script
    () => new Worker(
        new URL("createCalculatorWorker.js", import.meta.url),
        { type: "module" },
    ),
    Calculator,
);
```

```ts
// ./src/main.ts
import { createCalculatorWorker } from "./createCalculatorWorker.ts";

// Start a new worker thread waiting for work.
const worker = await createCalculatorWorker();

const element = document.querySelector("p");
let current = 2n;

for (let round = 0; element && round < 20; ++round) {
    // worker.obj is a proxy for the Calculator object on the worker
    // thread
    current = await worker.obj.multiply(current, current);
    element.textContent = `${current}`;
}
```

More facts that might not be immediately obvious:

- Contrary to `implementFunctionWorker()`, the function created by `implementObjectWorker()` returns a `Promise`. This
  is owed to the fact that the passed constructor is executed on the worker thread. So, if the `Calculator` constructor
  threw an error, it would be rethrown by `createCalculatorWorker()`.
- `worker.obj` acts as a proxy for the `Calculator` object served on the worker thread. `worker.obj` thus offers the
  same methods as a `Calculator` object, again with equivalent signatures.

## Advanced Topics

### Asynchronous Functions and Methods

These are fully supported out of the box, no special API needed.

### Simultaneous Calls

If client code does not await each call to `execute` or methods offered by the `obj` property of a given worker, it can
happen that a call is made even though a previously returned promise is still unsettled. In such a scenario the later
call is automatically queued and only executed after all previously returned promises have settled.

### Load Worker Code on the Worker Thread Only

What was done in a single file before is now split into two, with the following advantages:

- The code in *./src/getFibonacci.ts* is fully insulated from the rest of the application. It only exports a **type**.
  Type-only exports and imports are removed during compilation to ECMAScript. So, if the implementation of
  `getFibonacci()` involved significant amounts of code not used anywhere else, it would only be loaded by the worker
  thread.
- `implementWorkerExternal()` can be used to implement a new worker on any thread, not just the main thread (like
   `implementWorker()`).

## Motivation

You probably know that blocking the main thread of a browser for more than 50ms will lower the
[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) score of a site. That can happen very quickly,
e.g simply by using a crypto currency library.

### Web Workers are Surprisingly Hard to Use

While [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) seem to offer a relatively
straight-forward way to offload such operations onto a separate thread, it's surprisingly hard to get them right. Here
are just the most common pitfalls (you can find more in the
[tests](https://github.com/andreashuber69/kiss-worker/blob/develop/src/implementWorker.spec.ts)):

- A given web worker is often used from more than one place in the code, which introduces the danger of overlapping
  requests with several handlers simultaneously being subscribed to the `"message"` event. Doing so almost
  certainly introduces subtle bugs.
- Code executing on the worker might throw to signal error conditions. Such an unhandled exception in the worker thread
  will trigger the `"error"` event, but the calling thread will only get a generic `Error`. The original `Error` object
  is lost.

### Requirements for a Better Interface

The **Web Workers** interface was designed that way because it has to cover even the most exotic use cases. I would
claim you usually just need a transparent way to execute a given function on a different thread. Since **Web Workers**
aren't exactly new, on [npm](https://npmjs.com) there are hundreds of packages that attempt to do just that. The ones
I've seen all fail to satisfy at least one of the following requirements:

1. Provide **TypeScript** types and offer fully transparent marshalling of arguments, return values **and** `Error`
   objects. In other words, calling a function on a worker thread must feel much the same as calling the function
   on the current thread. To that end, it is imperative that the interface is `Promise`-based so that the caller can
   use `await`.
2. Follow the KISS principe (Keep It Simple, Stupid). In other words, the interface must be as simple as possible but
   no simpler. Many libraries disappoint in this department, because they've either failed to keep up with recent
   language improvements (e.g. `async` & `await`) or resort to simplistic solutions that will not work in the general
   case (e.g. sending a string representation of a function to the worker thread).
3. Cover the most common use cases well and leave the more exotic ones to other libraries. This approach minimizes the
   cost in the form of additional chunk size and thus helps to keep your site fast and snappy. For example,
   many of the features offered by the popular [`workerpool`](https://www.npmjs.com/package/workerpool) will go unused
   in the vast majority of the cases. Unsurprisingly, `workerpool` is 5 times larger than this library (minified and
   gzipped). To be clear: I'm sure there **is** a use case for all the features offered by `workerpool`, just not a very
   common one.
4. Automatically test all code of every release and provide code coverage metrics.
5. Last but not least: Provide comprehensive tutorial and reference documentation.
