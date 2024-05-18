// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import type { FunctionInfo } from "./FunctionInfo.js";
import type { FunctionWorker } from "./FunctionWorker.js";
import { FunctionWorkerImpl } from "./FunctionWorkerImpl.js";
import type { implementFunctionWorker } from "./implementFunctionWorker.js";
import type { serveFunction } from "./serveFunction.js";

/**
 * Creates a factory function returning an object implementing the {@linkcode FunctionWorker} interface.
 * @description Compared to {@linkcode implementFunctionWorker}, {@linkcode implementFunctionWorkerExternal} covers the
 * following additional requirements:
 * - The factory function returned by {@linkcode implementFunctionWorkerExternal} can be executed on **any** thread.
 * - The code of the served function is only ever loaded on the worker thread. This can become important when the
 * amount of code running on the worker thread is significant, such that you'd rather not load it anywhere else. Build
 * tools like [vite](vitejs.dev) support this use case by detecting `new Worker(...)` calls and putting the worker
 * script as well as all directly and indirectly called code into a separate chunk. Please see
 * [this example](https://github.com/andreashuber69/kiss-worker-demo3) for more information.
 * @param createWorker A function that creates a new [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
 * with every call. This function **must** create a worker running a script different from the one it is created in.
 * The script must call {@linkcode serveFunction} passing a function and export the type of said function.
 * @param _info An instance of {@linkcode FunctionInfo} instantiated with the type exported by the script running on the
 * worker thread.
 * @returns The factory function returning an object implementing the {@linkcode FunctionWorker} interface.
 */
export const implementFunctionWorkerExternal = <T extends (..._: never[]) => unknown>(
    createWorker: () => DedicatedWorker,
    _info: FunctionInfo<T>,
): () => FunctionWorker<T> =>
    () => new FunctionWorkerImpl<T>(createWorker);
