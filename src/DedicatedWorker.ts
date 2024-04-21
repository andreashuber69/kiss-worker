// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { implementWorker } from "./implementWorker.js";
import type { implementWorkerExternal } from "./implementWorkerExternal.js";

export type AddRemoveEventListener =
    ((event: "error", listener: () => void) => void) &
    ((event: "message", listener: (ev: { data: unknown }) => void) => void) &
    ((event: "messageerror", listener: () => void) => void);

/**
 * Exposes the minimally required interface of the object returned by the the `createWorker` parameter of the
 * {@linkcode implementWorker} and {@linkcode implementWorkerExternal} functions.
 * @description This is a subset of the [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker) interface
 * (currently available in browsers only).
 */
export interface DedicatedWorker {
    addEventListener: AddRemoveEventListener;
    removeEventListener: AddRemoveEventListener;
    postMessage: (args: never[]) => void;
    terminate: () => void;
}
