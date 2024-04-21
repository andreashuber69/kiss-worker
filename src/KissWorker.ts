// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { implementWorker } from "./implementWorker.js";
import type { implementWorkerExternal } from "./implementWorkerExternal.js";

/**
 * Represents the worker thread created by calling the constructor function returned by {@linkcode implementWorker} or
 * {@linkcode implementWorkerExternal}.
 */
export interface KissWorker<T extends (...args: never[]) => unknown> {
    /**
     * Calls the worker function on the worker thread.
     * @description Can be called multiple times without waiting for previous calls to settle. If done so, calls to the
     * worker function will be queued and executed as soon as the worker thread is available.
     * @param args The arguments to pass to the worker function.
     * @returns The return value of the worker function.
     * @throws The error thrown by the worker function.
     */
    execute: (...args: Parameters<T>) => Promise<ReturnType<T>>;

    /**
     * Terminates the worker thread at once. As of yet unsettled calls to {@linkcode KissWorker.execute} will never
     * settle.
     */
    terminate: () => void;
}
