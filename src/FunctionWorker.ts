// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { implementFunctionWorker } from "./implementFunctionWorker.js";
import type { implementFunctionWorkerExternal } from "./implementFunctionWorkerExternal.js";

/**
 * Represents the worker thread created by calling the constructor function returned by
 * {@linkcode implementFunctionWorker} or {@linkcode implementFunctionWorkerExternal}.
 */
export interface FunctionWorker<T extends (...args: never[]) => unknown> {
    /**
     * Calls the function served on the worker thread.
     * @description Can be called without waiting for previous calls to settle. If done so, calls to the served function
     * will be queued and executed as soon as the worker thread is available.
     * @param args The arguments to pass to the served function.
     * @returns The return value of the served function.
     * @throws The error thrown by the served function.
     */
    execute: (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;

    /**
     * Terminates the worker thread at once. As of yet unsettled calls to {@linkcode FunctionWorker.execute} will never
     * settle.
     */
    terminate: () => void;
}
