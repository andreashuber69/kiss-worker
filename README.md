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

Provides one of the easiest ways to run a function on a worker thread in the browser, in under 2kB of additional chunk
size!

[Features](#features)

[Prerequisites](#prerequisites)

[Getting Started](#getting-started)
    [Installation](#installation)
    [Example 1](#example-1)
    [Example 2](#example-2)

[Motivation](#motivation)
    [Web Workers are Surprisingly Hard to Use](#web-workers-are-surprisingly-hard-to-use)
    [A Better Interface](#a-better-interface)

## Features

- Full [TypeScript](https://typescriptlang.org) support with the best achievable type safety for all client code
- Fully transparent marshalling of arguments, return values **and** `Error` objects
- Sequentialization of simultaneous calls with a FIFO queue
- Support for synchronous and asynchronous worker functions
- Automated tests for >99% of the code
- Reporting of incorrectly implemented worker functions

## Prerequisites

This is an ESM-only package. If you're still targeting browsers without ESM support, this package is not for you.

## Getting Started

### Installation

`npm install kiss-worker`

If you are using a bundler, you might want add `--save-dev` to the command line.

### Example 1

The full code of this example can be found on [GitHub](https://github.com/andreashuber69/kiss-worker-demo1) and
[StackBlitz](https://stackblitz.com/~/github.com/andreashuber69/kiss-worker-demo1).

```ts
// ./src/GetFibonacciWorker.ts
import { implementWorker } from "kiss-worker";

// The function we want to execute on a worker thread (worker function)
const getFibonacci = (n: number): number =>
    (n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2);

export const GetFibonacciWorker = implementWorker(
    // A function that creates a web worker running this script
    () => new Worker(
        new URL("GetFibonacciWorker.js", import.meta.url),
        { type: "module" }
    ),
    // Our worker function
    getFibonacci,
);
```

That's it, we've defined our worker with a single statement! Let's see how we can use this from the main thread:

```html
<!-- index.html -->
<!-- ... -->
    <script type="module">
      import { GetFibonacciWorker } from "./src/GetFibonacciWorker.ts";
      // Start a new worker thread waiting for work.
      const worker = new GetFibonacciWorker();
      // Send the argument (40) to the worker thread, where it will be
      // passed to our worker function. In the mean time we're awaiting
      // the returned promise, which will eventually fulfill with the
      // result calculated on the worker thread.
      const result = await worker.execute(40);
      document.querySelector("h1").textContent = `${result}`;
    </script>
<!-- ... -->
```

Here are a few facts that might not be immediately obvious:

- Each call to `new GetFibonacciWorker()` starts a new and independent worker thread. If necessary, a thread could be
  terminated by calling `worker.terminate()`.
- The signature of `worker.execute()` is equivalent to the one of `getFibonacci()`. Of course, `Error`s thrown by
  `getFibonacci()` would also be rethrown by `worker.execute()`. The only difference is that `worker.execute()` is
  asynchronous, while `getFibonacci()` is synchronous.
- All involved code is based on ECMAScript modules (ESM), which is why we must pass `{ type: "module" }` to the `Worker`
  constructor. This allows us to use normal `import` statements in *./src/GetFibonacciWorker.ts* (as opposed to
  `importScripts()` required inside classic workers).
- *./src/GetFibonacciWorker.ts* is imported by code running on the main thread **and** is also the entry point for the
  worker thread. This is possible because `implementWorker()` detects on which thread it is run. However, this detection
  would **not** work correctly, if code in a worker thread attempted to start another worker thread. This can easily be
  fixed, as we will see in the next example.

### Example 2

The full code of this example can be found on [GitHub](https://github.com/andreashuber69/kiss-worker-demo2) and
[StackBlitz](https://stackblitz.com/~/github.com/andreashuber69/kiss-worker-demo2).

```ts
// ./src/getFibonacci.ts
import { serve } from "kiss-worker";

// The function we want to execute on a worker thread (worker function)
const getFibonacci = (n: number): number =>
    (n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2);

// Serve the function, so that it can be called from the thread that
// calls implementWorkerExternal
serve(getFibonacci);

// Export the type only
export type GetFibonacci = typeof getFibonacci;
```

```ts
// ./src/GetFibonacciWorker.ts
import { implementWorkerExternal } from "kiss-worker";

// Import the type of the worker function ...
import type { GetFibonacci } from "./getFibonacci.js";

// ... and pass it to establish type safety
export const GetFibonacciWorker = implementWorkerExternal<GetFibonacci>(
    // A function that creates a web worker running the script that
    // serves the worker function
    () => new Worker(
        new URL("getFibonacci.js", import.meta.url),
        { type: "module" }
    ),
);
```

The usage from *index.html* is identical to the one demonstrated in the [Example 1](#example-1).

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

### A Better Interface

The **Web Workers** interface was designed that way because it has to cover even the most exotic use cases. I would
claim that the vast majority just needs a transparent way to execute a given function on a different thread. Since
**Web Workers** aren't exactly new, on [npm](https://npmjs.com) you will find hundreds of packages that attempt to
do just that. The ones I've seen all fail to satisfy at least one of the following requirements:

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
   many of the features offered by the popular [workerpool](https://www.npmjs.com/package/workerpool) will go unused in
   the vast majority of the cases. Unsurprisingly, `workerpool` is 5 times larger than this library (minified and
   gzipped). To be clear: I'm sure there **is** a use case for all the features offered by `workerpool`, just not a very
   common one.
4. Automatically test all code of every release and provide code coverage metrics.
5. Last but not least: Provide comprehensive tutorial and reference documentation.
