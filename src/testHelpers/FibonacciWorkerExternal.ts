// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementWorkerExternal } from "../implementWorkerExternal.js";
import type { getFibonacci } from "./getFibonacci.js";

export const FibonacciWorker = implementWorkerExternal<typeof getFibonacci>(
    () => new Worker(new URL("getFibonacci.js", import.meta.url), { type: "module" }),
);
