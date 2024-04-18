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

```js
// FibonacciWorker.js
import { implementWorker } from "kiss-worker";

// The function we want to execute on a worker thread (the worker function).
const getFibonacci =
    (n) => ((n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2));

export const FibonacciWorker = implementWorker(
    // A function that creates a web worker running this script
    () => new Worker(new URL("FibonacciWorker.js", import.meta.url), { type: "module" }),
    // Our worker function
    getFibonacci,
);
```

Let's see how we can use this from the main thread:

```html
<!-- index.html -->
<!doctype html>
<html lang=en>
  <head>
    <meta charset=utf-8>
    <title>kiss-worker Test</title>
    <script type="module">
      import { FibonacciWorker } from "./FibonacciWorker.js";
      // Start a new worker thread waiting for work.
      const worker = new FibonacciWorker();
      // Send the argument (40) to the worker thread, where it will be passed
      // to our worker function. In the mean time we're awaiting the returned
      // promise, which will eventually fulfill with the result calculated on
      // the worker thread.
      const result = await worker.execute(40);
      document.querySelector("#result").textContent = `${result}`;
    </script>
  </head>
  <body>
    <h1 id="result"></h1>
  </body>
</html>
```

Now that was easy, wasn't it? Here are a few facts that might not be immediately obvious:

1. The call to `new FibonacciWorker()` starts the worker thread. If necessary, the thread could be terminated by calling
   `worker.terminate()`.
1. `worker.execute()` is a fully transparent proxy for `getFibonacci()`. It has the same parameters and the same
   return type. The only difference is that `worker.execute()` is asynchronous, while `getFibonacci()` is synchronous
   (of course, the transparency would extend to `Error`s thrown inside `getFibonacci()`).
1. All involved code is based on ECMAScript modules (ESM), which is why we must pass `{ type: "module" }` to the
   `Worker` constructor. This allows us to use normal `import` statements in `FibonacciWorker.js` (as opposed to
   `importScripts` required inside classic modules).
