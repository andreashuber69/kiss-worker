// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import type { DedicatedWorker } from "./DedicatedWorker.ts";
import { implementObjectWorkerExternal } from "./implementObjectWorkerExternal.ts";
import type { MethodsOnlyObject } from "./MethodsOnlyObject.ts";
import { ObjectInfo } from "./ObjectInfo.ts";
import type { ObjectWorker } from "./ObjectWorker.ts";
import { serveObject } from "./serveObject.ts";
import { isWorker } from "api";

/**
 * Creates a factory function returning an object implementing the {@linkcode ObjectWorker} interface.
 * @description This function covers the simplest use case: A factory function is implemented in a single file, which
 * is then imported into code running on the main thread. Please see
 * [this example](https://github.com/andreashuber69/kiss-worker-demo2) for more information.
 * NOTE: If the returned function needs to be called on other (non-main) threads,
 * {@linkcode implementObjectWorkerExternal} must be used to implement it.
 * @param createWorker A function that creates a new [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
 * with every call. This function **must** create a worker running the same script it is created in.
 * @param ctor The constructor function for the object that will be served on the worker thread. The worker thread will
 * store the object returned by this function and henceforth call the appropriate method on it for each call to one of
 * the methods of {@linkcode ObjectWorker.obj}.
 * @returns The factory function returning an object implementing the {@linkcode ObjectWorker} interface.
 */
export const implementObjectWorker = <
    C extends new (..._: never[]) => T,
    T extends MethodsOnlyObject<T> = InstanceType<C>,
>(
    createWorker: () => DedicatedWorker,
    ctor: C,
) => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    if (isWorker()) {
        serveObject<C, T>(ctor);
    }

    return implementObjectWorkerExternal(createWorker, new ObjectInfo<C, T>());
};
