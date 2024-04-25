// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementWorkerExternal } from "../implementWorkerExternal.js";
import type { GetFibonacci } from "./getFibonacci.js";

export const GetFibonacciWorker = implementWorkerExternal<GetFibonacci>(
    () => new Worker(new URL("getFibonacci.js", import.meta.url), { type: "module" }),
);
