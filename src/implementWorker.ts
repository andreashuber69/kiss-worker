// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import { implementWorkerExternal } from "./implementWorkerExternal.js";
import type { KissWorker } from "./KissWorker.js";
import { serve } from "./serve.js";

const isWorker = typeof WorkerGlobalScope !== "undefined" &&
    /* istanbul ignore next -- @preserve */
    self instanceof WorkerGlobalScope;

/**
 * Creates a new anonymous class implementing the {@linkcode KissWorker} interface and returns the constructor function.
 * @description This function covers the simplest use case: A {@linkcode KissWorker} is implemented in a single file,
 * which is then imported into code running on the main thread. Please see
 * [this example](https://github.com/andreashuber69/kiss-worker-demo1) for more information.
 * NOTE: If a {@linkcode KissWorker} needs to be imported on other threads, {@linkcode implementWorkerExternal} must be
 * used to implement it.
 * @param createWorker A function that creates a new [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
 * with every call. This function **must** create a worker running the same script it is created in.
 * @param workerFunction The function that will be executed on the worker thread with each call to
 * {@linkcode KissWorker.execute}.
 * @returns The constructor function of an anonymous class implementing the {@linkcode KissWorker} interface.
 */
export const implementWorker = <WorkerFunction extends (...args: never[]) => unknown>(
    createWorker: () => DedicatedWorker,
    workerFunction: WorkerFunction,
): new () => KissWorker<WorkerFunction> => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    if (isWorker) {
        serve(workerFunction);
    }

    // It appears that the only alternative to casting here is typing the parameter accordingly but that would
    // unnecessarily pollute the interface.
    return implementWorkerExternal<WorkerFunction>(
        createWorker as WorkerFunction extends never ? never : () => DedicatedWorker,
    );
};
