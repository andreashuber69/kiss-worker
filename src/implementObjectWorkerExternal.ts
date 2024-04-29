// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import type { implementObjectWorker } from "./implementObjectWorker.js";
import type { KissObjectWorker } from "./KissObjectWorker.js";
import { KissObjectWorkerImpl } from "./KissObjectWorkerImpl.js";
import type { serveObject } from "./serveObject.js";


/**
 * Creates a new anonymous class implementing the {@linkcode KissObjectWorker} interface and returns the constructor
 * function.
 * @description Compared to {@linkcode implementObjectWorker}, {@linkcode implementObjectWorkerExternal} covers the
 * following additional requirements:
 * - The constructor function returned by {@linkcode implementObjectWorkerExternal} can be executed on **any** thread.
 * - The code of the served object is only ever loaded on the worker thread. This can become important when the amount
 * of code of the served object is significant, such that you'd rather not load it on the thread calling
 * {@linkcode KissObjectWorker.obj}. Build tools like [vite](vitejs.dev) support this use case by detecting
 * `new Worker(...)` calls and putting the worker script as well as all directly and indirectly called code into a
 * separate chunk. Please see [this example](https://github.com/andreashuber69/kiss-worker-demo2) for more information.
 * @param createWorker A function that creates a new [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
 * with every call. This function **must** create a worker running a script different from the one it is created in.
 * Said script must call {@linkcode serveObject} passing a constructor function and export a descriptor, which is then
 * passed to this function.
 * @returns The constructor function of an anonymous class implementing the {@linkcode KissObjectWorker} interface.
 * @typeParam T The type of the served object. {@linkcode KissObjectWorker.obj} will have equally named methods with
 * equivalent signatures.
 */
export const implementObjectWorkerExternal = <T extends Record<keyof T, (...args: never[]) => unknown>>(
    createWorker: () => DedicatedWorker,
    ctor: new () => T,
): new () => KissObjectWorker<T> =>
    class extends KissObjectWorkerImpl<T> {
        public constructor() {
            super(createWorker, ctor);
        }
    };
