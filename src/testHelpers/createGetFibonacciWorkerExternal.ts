// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { FunctionInfo } from "../FunctionInfo.js";
import { implementFunctionWorkerExternal } from "../implementFunctionWorkerExternal.js";
import type { getFibonacciExternal } from "./getFibonacciExternal.js";

export const createGetFibonacciWorker = implementFunctionWorkerExternal(
    () => new Worker(new URL("getFibonacciExternal.js", import.meta.url), { type: "module" }),
    new FunctionInfo<typeof getFibonacciExternal>(),
);
