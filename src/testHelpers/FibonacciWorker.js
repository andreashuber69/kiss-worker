// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementWorker } from "../..";

// The function we would like to execute on a worker thread (the worker function).
const getFibonacci =
    (n) => ((n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2));

export const FibonacciWorker = implementWorker(
    // A function that creates a web worker running this script
    () => new Worker(new URL("FibonacciWorker.js", import.meta.url), { type: "module" }),
    // Our worker function
    getFibonacci,
);
