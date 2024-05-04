// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import { implementObjectWorkerExternal } from "./implementObjectWorkerExternal.js";
import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";
import { ObjectInfo } from "./ObjectInfo.js";
import type { ObjectWorker } from "./ObjectWorker.js";
import { serveObject } from "./serveObject.js";
import type { UnionToTuple } from "./UnionToTuple.js";

const isWorker = typeof WorkerGlobalScope !== "undefined" &&
    /* istanbul ignore next -- @preserve */
    self instanceof WorkerGlobalScope;

const getAllPropertyNames = (prototype: unknown): string[] => {
    if (prototype && prototype !== Object.prototype) {
        return [
            ...Object.getOwnPropertyNames(prototype).filter((v) => v !== "constructor"),
            ...getAllPropertyNames(Object.getPrototypeOf(prototype)),
        ];
    }

    return [];
};

/**
 * Provides a function returning an object implementing the {@linkcode ObjectWorker} interface.
 * @description This function covers the simplest use case: A {@linkcode ObjectWorker} is implemented in a single
 * file, which is then imported into code running on the main thread. Please see
 * [this example](https://github.com/andreashuber69/kiss-worker-demo2) for more information.
 * NOTE: If the returned function needs to be called on other (non-main) threads,
 * {@linkcode implementObjectWorkerExternal} must be used to implement it.
 * @param createWorker A function that creates a new [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
 * with every call. This function **must** create a worker running the same script it is created in.
 * @param ctor The constructor function for the object that will be served on the worker thread. The worker thread will
 * store the object returned by this function and henceforth call the appropriate method on it for each call to one of
 * the methods of {@linkcode ObjectWorker.obj}.
 * @returns The function returning an object implementing the {@linkcode ObjectWorker} interface.
 */
export const implementObjectWorker = <
    C extends new (...args: never[]) => T,
    T extends MethodsOnlyObject<T> = InstanceType<C>,
>(
    createWorker: () => DedicatedWorker,
    ctor: C,
): (...args2: ConstructorParameters<C>) => Promise<ObjectWorker<T>> => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    if (isWorker) {
        serveObject<C, T>(ctor);
    }

    const propertyNames = getAllPropertyNames(ctor.prototype) as UnionToTuple<keyof T>;
    return implementObjectWorkerExternal(createWorker, new ObjectInfo<C, T>(...propertyNames));
};
