// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementWorkerExternal } from "../implementWorkerExternal.js";

// Import the type of our worker function
import type { getFibonacci } from "./getFibonacci.js";

// Implement and export our worker, passing the type of the worker function
export const FibonacciWorker = implementWorkerExternal<typeof getFibonacci>(
    // A function that creates a web worker running the worker script
    () => new Worker(new URL("getFibonacci.js", import.meta.url), { type: "module" }),
);
