// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import { implementObjectWorkerExternal } from "./implementObjectWorkerExternal.js";
import type { KissObjectWorker } from "./KissObjectWorker.js";
import { serveObject } from "./serveObject.js";

const isWorker = typeof WorkerGlobalScope !== "undefined" &&
    /* istanbul ignore next -- @preserve */
    self instanceof WorkerGlobalScope;

/**
 * Creates a new anonymous class implementing the {@linkcode KissObjectWorker} interface and returns the constructor
 * function.
 * @description This function covers the simplest use case: A {@linkcode KissObjectWorker} is implemented in a single
 * file, which is then imported into code running on the main thread. Please see
 * [this example](https://github.com/andreashuber69/kiss-worker-demo1) for more information.
 * NOTE: If a {@linkcode KissObjectWorker} needs to be imported on other threads,
 * {@linkcode implementObjectWorkerExternal} must be used to implement it.
 * @param createWorker A function that creates a new [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
 * with every call. This function **must** create a worker running the same script it is created in.
 * @param ctor The constructor function for the object that will be served on the worker thread. The worker thread will
 * store the object returned by this function and henceforth call the appropriate method on it for each call to one of
 * the methods of {@linkcode KissObjectWorker.obj}.
 * @returns The constructor function of an anonymous class implementing the {@linkcode KissObjectWorker} interface.
 * @typeParam T The type of the served object. {@linkcode KissObjectWorker.obj} will have equally named methods with
 * equivalent signatures.
 */
export const implementObjectWorker = <T extends Record<keyof T, (...args: never[]) => unknown>>(
    createWorker: () => DedicatedWorker,
    ctor: new () => T,
): new () => KissObjectWorker<T> => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    if (isWorker) {
        serveObject(ctor);
    }

    return implementObjectWorkerExternal(createWorker, ctor);
};
