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

Provides one of the easiest ways to use a worker thread.

1. [Features](#features)
1. [Prerequisites](#prerequisites)
1. [Getting Started](#getting-started)
   - [Installation](#installation)
   - [Example 1: Single Function](#example-1-single-function)
   - [Example 2: Object](#example-2-object)
1. [Advanced Topics](#advanced-topics)
   - [Asynchronous Functions and Methods](#asynchronous-functions-and-methods)
   - [Simultaneous Calls](#simultaneous-calls)
   - [Worker Script File Extensions](#worker-script-file-extensions)
   - [Worker Code Isolation](#worker-code-isolation)
1. [Limitations](#limitations)
1. [Motivation](#motivation)
   - [Web Workers are Surprisingly Hard to Use](#web-workers-are-surprisingly-hard-to-use)
   - [Requirements for a Better Interface](#requirements-for-a-better-interface)

## Features

- Full [TypeScript](https://typescriptlang.org) support with the best achievable type safety for client code
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
import { implementFunctionWorker, Worker } from "kiss-worker";

// The function we want to execute on a worker thread
const fibonacci = (n: number): number =>
    ((n < 2) ? Math.floor(n) : fibonacci(n - 1) + fibonacci(n - 2));

export const createFibonacciWorker = implementFunctionWorker(
    // A function that creates a web worker running this script
    () => new Worker(
        new URL("createFibonacciWorker.ts", import.meta.url),
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

- For the same client code to work on node and in the browser, the worker scripts must be referenced with a *.ts*
  extension. To be consistent, all example code also uses *.ts* for `import`. If you have a web-only project using this
  library, you might want to stick to the standard *.js* extensions. See [Node Compatibility](#node-compatibility) for
  more information.
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
- In order for build tools to be able to put worker code into a separate chunk, it is vital that the expression
  `() => new Worker(new URL("createFibonacciWorker.ts", import.meta.url), { type: "module" })` is kept as is. Please see
  associated instructions for [vite](https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url) and
  [webpack](https://webpack.js.org/guides/web-workers/). Other build tools will likely have similar constraints.
- For browser-only code, the `Worker` import would not be necessary, as it is just an alias for the `Worker` class
  available in browsers. We are nevertheless importing it from `"kiss-worker"` so that we could run the exact same code
  in a node environment.

### Example 2: Object

The full code of this example can be found on [GitHub](https://github.com/andreashuber69/kiss-worker-demo2) and
[StackBlitz](https://stackblitz.com/~/github.com/andreashuber69/kiss-worker-demo2).

Sometimes it's not enough to serve just a single function on a worker thread, which is why this library also supports
serving objects:

```ts
// ./src/createCalculatorWorker.ts
import { implementObjectWorker, Worker } from "kiss-worker";

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
        new URL("createCalculatorWorker.ts", import.meta.url),
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
  `Promise`. This is owed to the fact that the passed constructor function is executed on the worker thread. So, if the
  `Calculator` constructor threw an error, it would be rethrown by `createCalculatorWorker()`.
- If the `Calculator` constructor required parameters, we'd need to pass the associated arguments to
  `createCalculatorWorker()`.
- `worker.obj` acts as a proxy for the `Calculator` object served on the worker thread. `worker.obj` thus offers the
  same methods as a `Calculator` object, again with equivalent signatures.

## Advanced Topics

### Asynchronous Functions and Methods

These are fully supported out of the box, no special API needed.

### Simultaneous Calls

If client code does not await each call to `execute` or methods offered by the `obj` property of a given worker, it can
happen that a call is made even though a previously returned promise is still unsettled. In such a scenario the later
call is automatically queued and only executed after all previously returned promises have settled.

### Node Compatibility

As mentioned [above](#example-1-single-function), all examples reference worker scripts with a *.ts* extension, for
example:

```ts
    () => new Worker(
        new URL("createFibonacciWorker.ts", import.meta.url),
        { type: "module" },
    ),
```

When this code is compiled for the browser, [vite](https://vitejs.dev/) detects the `Worker` constructor call and
compiles *createFibonacciWorker.ts* into a separate chunk, such that everything works as expected at runtime (the same
would be true if we passed `"createFibonacciWorker.js"`). However, no such detection takes place when we compile this
code for node. Even worse, while running tests on node, [vitest](https://vitest.dev/) seems to compile code on a file by
file basis and the emitted ECMAScript code isn't ever written to the file system. So, there seems to be no way to load
**emitted** code into a node worker when running **vitest** directly on **TypeScript** files.

This is why the worker of the node version of this library is able to load *.ts* files directly and internally uses
[tsx](https://www.npmjs.com/package/tsx) to compile it to runnable code. This way, it is possible to run exactly the
same tests on node and in the browser. This compatibility extends to production code, but of course comes with the
additional **tsx** dependency and the need to deploy the source code of all worker scripts.

For node compatibility it therefore seems to be necessary to reference the source *.ts* files of at least worker
scripts. To be consistent, this library also uses *.ts* extensions for `import`. By default, the **TypeScript** compiler
only allows *.js* extensions. They are accepted here, because all code is compiled with the
[`noEmit`](https://www.typescriptlang.org/tsconfig/#noEmit) and
[`allowImportingTsExtensions`](https://www.typescriptlang.org/tsconfig/#allowImportingTsExtensions), see
[tsconfig.json](https://github.com/andreashuber69/kiss-worker/blob/develop/src/tsconfig.json).

To cut a long story short:

- If your project uses this library for code running in a browser only, it probably makes sense to stick with *.js*
  extensions for `import` and worker script file names, as that is the established standard for **TypeScript** code.
  **vite** and **webpack** automatically detect what code is run on a worker thread and build appropriate chunks. The
  same is probably true for other bundlers.
- If your code needs to run on node **and** you happen to use `vite build` and/or **vitest**, it might make sense to
  exclusively use *.ts* extensions to reference worker scripts. Note that this requires the deployment of the *.ts*
  source code of the worker scripts and **tsx** needs to be available in the production environment.
- Finally, you can also build the worker scripts in an extra step, deploy them with the rest of the emitted code and
  then have the worker load the built *.js* code. The node version doesn't use **tsx** on *.js* files and thus avoids
  the **tsx** dependency and its runtime overhead.

### Worker Code Isolation

As hinted at [above](#example-1-single-function), the implementation of a worker in a single file has its downsides,
which is why it's sometimes necessary to fully isolate worker code from the rest of the application. For this purpose
`implementFunctionWorkerExternal()` and `implementObjectWorkerExternal()` are provided. Using these instead of their
counterparts has the following advantages:

- A factory function returned by `implementFunctionWorkerExternal()` or `implementObjectWorkerExternal()` can be
  executed on **any** thread (not just the main thread).
- The code of the served function or object is only ever loaded on the worker thread. This can become important when the
  amount of code running on the worker thread is significant, such that you'd rather not load it anywhere else.

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
import { FunctionInfo, implementFunctionWorkerExternal, Worker } from
    "kiss-worker";

// Import the type only
import type { fibonacci } from "./fibonacci.ts";

export const createFibonacciWorker = implementFunctionWorkerExternal(
    // A function that creates a web worker running the script serving
    // the function
    () => new Worker(
        new URL("fibonacci.ts", import.meta.url),
        { type: "module" },
    ),
    new FunctionInfo<typeof fibonacci>(),
);
```

The usage from *./src/main.ts* is the same as in [Example 1](#example-1-single-function). What was done in a single file
before is now split into two. Note that *./src/fibonacci.ts* only exports a **type**, so we can no longer pass
the function itself. Instead, we pass a `FunctionInfo` instance to convey the required information. Type-only exports
and imports are removed during compilation to ECMAScript.

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
import { ObjectInfo, implementObjectWorkerExternal, Worker } from "kiss-worker";

// Import the type only
import type { Calculator } from "./Calculator.ts";

export const createCalculatorWorker = implementObjectWorkerExternal(
    // A function that creates a web worker running the script serving
    // the object
    () => new Worker(
        new URL("Calculator.ts", import.meta.url),
        { type: "module" },
    ),
    // Provide required information about the served object
    new ObjectInfo<typeof Calculator>(),
);
```

The usage from *./src/main.ts* is the same as in [Example 2](#example-2-object). Again, note that *./src/Calculator.ts*
only exports a **type**, so we can no longer pass the constructor function itself. Instead, we pass an `ObjectInfo`
instance to convey the required information.

## Limitations

- [Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage#transfer) are not currently
  passed as transferable, they are thus always copied. Support would be easy to add if it was acceptable for a given
  worker that all transferable objects are either always or never transferred.
- At compile time, the interface of a served object is assumed to consist of all properties with a `string` key. At
  runtime, the object and its prototype chain is examined with `Object.getOwnPropertyNames()`. The former will only
  return properties declared `public` in the TypeScript code while the latter will return all properties except those
  [with a name staring with #](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties).
  To avoid surprises, it is best to ensure that both sets of properties are identical, which can easily be achieved by
  **not** declaring anything `protected` or `private`.
- The public interface of an object served on a worker thread cannot currently consist of anything else than methods,
  which is enforced at compile time. The rationale is documented on
  [`MethodsOnlyObject`](https://github.com/andreashuber69/kiss-worker/blob/develop/src/MethodsOnlyObject.ts).

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
