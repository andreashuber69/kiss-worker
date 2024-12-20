// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import type { implementFunctionWorker } from "./implementFunctionWorker.ts";
import type { implementFunctionWorkerExternal } from "./implementFunctionWorkerExternal.ts";
import type { implementObjectWorker } from "./implementObjectWorker.ts";
import type { implementObjectWorkerExternal } from "./implementObjectWorkerExternal.ts";

export type AddRemoveEventListener =
    (event: "error" | "message" | "messageerror", listener: (ev: object) => void) => void;

/**
 * Exposes the minimally required interface of the object returned by the the `createWorker` parameter of the
 * {@linkcode implementFunctionWorker}, {@linkcode implementFunctionWorkerExternal}, {@linkcode implementObjectWorker}
 * and {@linkcode implementObjectWorkerExternal} functions.
 * @description This is a subset of the [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker) interface.
 */
export interface DedicatedWorker {
    addEventListener: AddRemoveEventListener;
    removeEventListener: AddRemoveEventListener;
    postMessage: (message: unknown) => void;
    terminate: () => void;
}
