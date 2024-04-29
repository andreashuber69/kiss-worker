// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { implementFunctionWorker } from "./implementFunctionWorker.js";
import type { implementFunctionWorkerExternal } from "./implementFunctionWorkerExternal.js";

export type AddRemoveEventListener =
    (event: "error" | "message" | "messageerror", listener: (ev: unknown) => void) => void;

/**
 * Exposes the minimally required interface of the object returned by the the `createWorker` parameter of the
 * {@linkcode implementFunctionWorker} and {@linkcode implementFunctionWorkerExternal} functions.
 * @description This is a subset of the [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker) interface
 * (currently available in browsers only).
 */
export interface DedicatedWorker {
    addEventListener: AddRemoveEventListener;
    removeEventListener: AddRemoveEventListener;
    postMessage: (args: never[]) => void;
    terminate: () => void;
}
