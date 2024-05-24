// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementFunctionWorker, Worker } from "../index.js";

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
