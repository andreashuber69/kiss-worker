// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { implementObjectWorker } from "./implementObjectWorker.js";
import type { implementObjectWorkerExternal } from "./implementObjectWorkerExternal.js";
import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";
import type { Promisify } from "./Promisify.js";

/**
 * Represents the worker thread created by calling the constructor function returned by
 * {@linkcode implementObjectWorker} or {@linkcode implementObjectWorkerExternal}.
 */
export interface ObjectWorker<T extends MethodsOnlyObject<T>> {
    /**
     * Gets a proxy for the object created on the worker thread. The arguments for each call made to any of the methods
     * of {@linkcode ObjectWorker.obj} are sent to the worker thread where the actual function is called.
     * @description Methods of {@linkcode ObjectWorker.obj} can be called without waiting for previous calls to
     * settle. If done so, calls will be queued and executed as soon as the worker thread is available.
     */
    get obj(): Promisify<T>;

    /**
     * Terminates the worker thread at once. As of yet unsettled calls to any of the methods of
     * {@linkcode ObjectWorker.obj} will never settle.
     */
    terminate: () => void;
}
