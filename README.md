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

Provides one of the easiest ways to use a worker thread in the browser, in ~2kB additional chunk size!

1. [Features](#features)
1. [Prerequisites](#prerequisites)
1. [Getting Started](#getting-started)
   - [Installation](#installation)
   - [Example 1: Single Function](#example-1-single-function)
   - [Example 2: Object](#example-2-object)
1. [Advanced Topics](#advanced-topics)
   - [Asynchronous Functions and Methods](#asynchronous-functions-and-methods)
   - [Simultaneous Calls](#simultaneous-calls)
   - [Worker Code Isolation](#worker-code-isolation)
1. [Limitations](#limitations)
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
- Tree shaking friendly (only pay for what you use)

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

- Each call to the `createFibonacciWorker()` factory function starts a new and independent worker thread. If necessary,
  a thread could be terminated by calling `worker.terminate()`.
- The signature of `worker.execute()` is equivalent to the one of `fibonacci()`. Of course, `Error`s thrown by
  `fibonacci()` would also be rethrown by `worker.execute()`. The only difference is that `worker.execute()` is
  asynchronous, while `fibonacci()` is synchronous.
- All involved code is based on ECMAScript modules (ESM), which is why we must pass `{ type: "module" }` to the `Worker`
  constructor. This allows us to use normal `import` statements in *./src/createFibonacciWorker.ts* (as opposed to
  `importScripts()` required inside classic workers).
- *./src/createFibonacciWorker.ts* is imported by code running on the main thread **and** is also the entry point for
  the worker thread. This is possible because `implementFunctionWorker()` detects on which thread it is run. However,
  this detection would **not** work correctly, if code in a worker thread attempted to start another worker thread. This
  can easily be fixed, see [Worker Code Isolation](#worker-code-isolation).

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

- Contrary to `implementFunctionWorker()`, the factory function created by `implementObjectWorker()` returns a
  `Promise`. This is owed to the fact that the passed constructor is executed on the worker thread. So, if the
  `Calculator` constructor threw an error, it would be rethrown by `createCalculatorWorker()`.
- `worker.obj` acts as a proxy for the `Calculator` object served on the worker thread. `worker.obj` thus offers the
  same methods as a `Calculator` object, again with equivalent signatures.

## Advanced Topics

### Asynchronous Functions and Methods

These are fully supported out of the box, no special API needed.

### Simultaneous Calls

If client code does not await each call to `execute` or methods offered by the `obj` property of a given worker, it can
happen that a call is made even though a previously returned promise is still unsettled. In such a scenario the later
call is automatically queued and only executed after all previously returned promises have settled.

### Worker Code Isolation

As hinted at [above](#example-1-single-function), the implementation of a worker in a single file has its downsides,
which is why it's sometimes necessary to fully isolate worker code from the rest of the application. For this purpose
`implementFunctionWorkerExternal()` and `implementObjectWorkerExternal()` are provided. Using these instead of their
counterparts has the following advantages:

- A factory function returned by `implementFunctionWorkerExternal()` or `implementObjectWorkerExternal()` can be
  executed on **any** thread (not just the main thread).
- The code of the served function or object is only ever loaded on the worker thread. This can become important when the
  amount of code running on the worker thread is significant, such that you'd rather not load it anywhere else. Build
  tools like [vite](vitejs.dev) support this use case by detecting `new Worker(...)` calls and putting the worker script
  as well as all directly and indirectly called code into a separate chunk.

Lets see how [Example 1](#example-1-single-function) can be implemented such that worker code is fully isolated.

The full code of this example can be found on [GitHub](https://github.com/andreashuber69/kiss-worker-demo3) and
[StackBlitz](https://stackblitz.com/~/github.com/andreashuber69/kiss-worker-demo3).

```ts
// ./src/fibonacci.ts
import { serveFunction } from "kiss-worker";

// The function we want to execute on a worker thread
const fibonacci = (n: number): number =>
    ((n < 2) ? Math.floor(n) : fibonacci(n - 1) + fibonacci(n - 2));

// Serve the function so that it can be called from the thread executing
// implementFunctionWorkerExternal
serveFunction(fibonacci);

// Export the type only
export type { fibonacci };
```

```ts
// ./src/createFibonacciWorker.ts
import { FunctionInfo, implementFunctionWorkerExternal } from
    "kiss-worker";

// Import the type only
import type { fibonacci } from "./fibonacci.js";

export const createFibonacciWorker = implementFunctionWorkerExternal(
    // A function that creates a web worker running the script serving
    // the function
    () => new Worker(
        new URL("fibonacci.js", import.meta.url),
        { type: "module" },
    ),
    new FunctionInfo<typeof fibonacci>(),
);
```

The usage from *./src/main.ts* is the same as in [Example 1](#example-1-single-function). What was done in a single file
before is now split into two. Note that *./src/fibonacci.ts* only exports a **type**. Type-only exports and imports are
removed during compilation to ECMAScript.

Finally, let's see how [Example 2](#example-2-object) can be implemented such that worker code is fully isolated.

The full code of this example can be found on [GitHub](https://github.com/andreashuber69/kiss-worker-demo4) and
[StackBlitz](https://stackblitz.com/~/github.com/andreashuber69/kiss-worker-demo4).

```ts
// ./src/Calculator.ts
import { serveObject } from "kiss-worker";

// We want to serve an object of this class on a worker thread
class Calculator {
    public multiply(left: bigint, right: bigint) {
        return left * right;
    }

    public divide(left: bigint, right: bigint) {
        return left / right;
    }
}

// Pass the constructor function of the class so that the worker thread
// can create a new object and its methods can be called from the thread
// executing implementObjectWorkerExternal
serveObject(Calculator);

// Export the type only
export type { Calculator };
```

```ts
// ./src/createCalculatorWorker.ts
import { ObjectInfo, implementObjectWorkerExternal } from "kiss-worker";

// Import the type only
import type { Calculator } from "./Calculator.js";

export const createCalculatorWorker = implementObjectWorkerExternal(
    // A function that creates a web worker running the script serving
    // the object
    () => new Worker(
        new URL("Calculator.js", import.meta.url),
        { type: "module" },
    ),
    // Provide required information about the served object
    new ObjectInfo<typeof Calculator>("multiply", "divide"),
);
```

Again, the usage from *./src/main.ts* is the same as in [Example 2](#example-2-object). Note that
`implementObjectWorkerExternal` can only work as advertised if it knows the method names of the object being served on
the worker thread. Due to TypeScript design constraints, method names cannot be extracted from a type at runtime and
therefore have to be supplied by the user. The `ObjectInfo` class supports this process by ensuring that the supplied
method names are always in sync with the method names declared by the type. If they are not, the TS compiler will show
an error.

## Limitations

- [Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage#transfer) are not currently
  passed as transferable, they are thus always copied. Support would be easy to add if it was acceptable for a given
  worker that all transferable objects are either always or never transferred.
- The type of an object served on a worker thread cannot currently contain anything else than methods, which is enforced
  at compile time with
  [`MethodsOnlyObject`](https://github.com/andreashuber69/kiss-worker/blob/develop/src/MethodsOnlyObject.ts). Properties
  of the served object are currently discovered differently, depending on how client code chooses to implement a worker.
  The intersection of these two variants leaves methods as the only supportable type of property.
  - At runtime, `implementObjectWorker` discovers methods through the `prototype` property of the passed
    constructor function. Non-function properties are not discoverable through the prototype.
  - `implementObjectWorkerExternal` accepts a (compiler-checked) list of the callable methods.
  Both limitations will be addressed in future versions.

## Motivation

You probably know that blocking the main thread of a browser for more than 50ms will lower the
[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) score of a site. That can happen very quickly,
e.g simply by using a crypto currency library.

### Web Workers are Surprisingly Hard to Use

While [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) seem to offer a relatively
straight-forward way to offload such operations onto a separate thread, it's surprisingly hard to get them right. Here
are just the most common pitfalls (you can find more in the
[tests](https://github.com/andreashuber69/kiss-worker/blob/develop/src/implementFunctionWorker.spec.ts)):

- A given web worker is often used from more than one place in the code, which introduces the danger of overlapping
  requests with several handlers simultaneously being subscribed to the `"message"` event. Doing so almost
  certainly introduces subtle bugs.
- Code executing on the worker might throw to signal error conditions. Such an unhandled exception in the worker thread
  will trigger the `"error"` event, but the calling thread will only get a generic `Error`. The original `Error` object
  is lost.

### Requirements for a Better Interface

The **Web Workers** interface was designed that way because it has to cover even the most exotic use cases. I would
claim you usually just need a transparent way to execute a single function or methods of an object on a different
thread. Since **Web Workers** aren't exactly new, on [npm](https://npmjs.com) there are hundreds of packages that
attempt to do just that. The ones I've seen all fail to satisfy at least one of the following requirements:

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
   in the vast majority of the cases. Unsurprisingly, `workerpool` is >3 times larger than this library (minified and
   gzipped). To be clear: I'm sure there **is** a use case for all the features offered by `workerpool`, just not a very
   common one.
4. Automatically test all code of every release and provide code coverage metrics.
5. Last but not least: Provide comprehensive tutorial and reference documentation.
