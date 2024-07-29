// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import { FunctionInfo, implementFunctionWorkerExternal, Worker } from "../index.ts";
import type { fibonacciExternal } from "./fibonacciExternal.ts";

export const createFibonacciWorkerExternal = implementFunctionWorkerExternal(
    () => new Worker(new URL("fibonacciExternal.ts", import.meta.url), { type: "module" }),
    new FunctionInfo<typeof fibonacciExternal>(),
);
