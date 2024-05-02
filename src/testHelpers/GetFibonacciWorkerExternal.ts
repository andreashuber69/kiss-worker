// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { FunctionInfo } from "../FunctionInfo.js";
import { implementFunctionWorkerExternal } from "../implementFunctionWorkerExternal.js";
import type { GetFibonacci } from "./getFibonacci.js";

export const GetFibonacciWorker = implementFunctionWorkerExternal(
    () => new Worker(new URL("getFibonacci.js", import.meta.url), { type: "module" }),
    new FunctionInfo<GetFibonacci>(),
);
