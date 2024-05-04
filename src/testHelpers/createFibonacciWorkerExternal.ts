// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { FunctionInfo } from "../FunctionInfo.js";
import { implementFunctionWorkerExternal } from "../implementFunctionWorkerExternal.js";
import type { fibonacciExternal } from "./fibonacciExternal.js";

export const createFibonacciWorkerExternal = implementFunctionWorkerExternal(
    () => new Worker(new URL("fibonacciExternal.js", import.meta.url), { type: "module" }),
    new FunctionInfo<typeof fibonacciExternal>(),
);
