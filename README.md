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

Provides one of the simplest ways to offload work onto a worker thread in the browser, in under 2kB of additional chunk
size!

## Prerequisites

This is an ESM-only package. If you're still targeting browsers without ESM support, this package is not for you.

## Getting Started

### Installation

`npm install kiss-worker`

If you are using a bundler, you might want add `--save-dev` to the command line.

### Example

[Full Code](https://github.com/andreashuber69/kiss-worker-demo1),
[StackBlitz](https://stackblitz.com/~/github.com/andreashuber69/kiss-worker-demo1)

```js
// ./src/FibonacciWorker.ts
import { implementWorker } from "kiss-worker";

// The function we want to execute on a worker thread (worker function).
const getFibonacci = (n: number): number =>
    ((n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2));

export const FibonacciWorker = implementWorker(
    // A function that creates a web worker running this script
    () => new Worker(
        new URL("FibonacciWorker.js", import.meta.url),
        { type: "module" }
    ),
    // Our worker function
    getFibonacci,
);
```

Let's see how we can use this from the main thread:

```html
<!-- index.html -->
    <!-- ... -->
    <script type="module">
      import { FibonacciWorker } from "./src/FibonacciWorker.ts";
      // Start a new worker thread waiting for work.
      const worker = new FibonacciWorker();
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

- The call to `new FibonacciWorker()` starts the worker thread. If necessary, the thread could be terminated by calling
  `worker.terminate()`.
- `worker.execute()` is a fully transparent proxy for `getFibonacci()`. It has the same parameters and the same return
  type (of course, the transparency would extend to `Error`s thrown inside `getFibonacci()`). The only difference is
  that `worker.execute()` is asynchronous, while `getFibonacci()` is synchronous.
- All involved code is based on ECMAScript modules (ESM), which is why we must pass `{ type: "module" }` to the
  `Worker` constructor. This allows us to use normal `import` statements in `FibonacciWorker.js` (as opposed to
  `importScripts` required inside classic modules).

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
