// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { FunctionInfo, implementFunctionWorkerExternal, Worker } from "../index.js";
import type { fibonacciExternal } from "./fibonacciExternal.js";

export const createFibonacciWorkerExternal = implementFunctionWorkerExternal(
    () => new Worker(new URL("fibonacciExternal.ts", import.meta.url), { type: "module" }),
    new FunctionInfo<typeof fibonacciExternal>(),
);
