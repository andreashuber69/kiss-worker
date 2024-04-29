// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { implementObjectWorker } from "./implementObjectWorker.js";
import type { implementObjectWorkerExternal } from "./implementObjectWorkerExternal.js";
import type { Promisify } from "./Promisify.js";

/**
 * Represents the worker thread created by calling the constructor function returned by
 * {@linkcode implementObjectWorker} or {@linkcode implementObjectWorkerExternal}.
 */
export interface KissObjectWorker<T extends Record<keyof T, (...args: never[]) => unknown>> {
    /**
     * Gets a proxy for the object created on the worker thread. The arguments for each call made to any of the methods
     * of {@linkcode KissObjectWorker.obj} are sent to the worker thread where the actual function is called.
     * @description Methods of {@linkcode KissObjectWorker.obj} can be called without waiting for previous calls to
     * settle. If done so, calls will be queued and executed as soon as the worker thread is available.
     */
    get obj(): Promisify<T>;

    /**
     * Terminates the worker thread at once. As of yet unsettled calls to any of the methods of
     * {@linkcode KissObjectWorker.obj} will never settle.
     */
    terminate: () => void;
}