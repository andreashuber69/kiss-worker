// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import { FunctionInfo } from "./FunctionInfo.js";
import type { FunctionWorker } from "./FunctionWorker.js";
import { implementFunctionWorkerExternal } from "./implementFunctionWorkerExternal.js";
import { isWorker } from "./isWorker.js";
import { serveFunction } from "./serveFunction.js";

/**
 * Creates a factory function returning an object implementing the {@linkcode FunctionWorker} interface.
 * @description This function covers the simplest use case: A factory function is implemented in a single file, which
 * is then imported into code running on the main thread. Please see
 * [this example](https://github.com/andreashuber69/kiss-worker-demo1) for more information.
 * NOTE: If the returned function needs to be called on other (non-main) threads,
 * {@linkcode implementFunctionWorkerExternal} must be used to implement it.
 * @param createWorker A function that creates a new [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
 * with every call. This function **must** create a worker running the same script it is created in.
 * @param func The function that will be served on the worker thread. The worker thread will call this function for each
 * call to {@linkcode FunctionWorker.execute}.
 * @returns The factory function returning an object implementing the {@linkcode FunctionWorker} interface.
 */
export const implementFunctionWorker = <T extends (...args: never[]) => unknown>(
    createWorker: () => DedicatedWorker,
    func: T,
): () => FunctionWorker<T> => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    if (isWorker()) {
        serveFunction(func);
    }

    return implementFunctionWorkerExternal(createWorker, new FunctionInfo<T>());
};
