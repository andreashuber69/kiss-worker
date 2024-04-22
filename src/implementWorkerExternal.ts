// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import type { implementWorker } from "./implementWorker.js";
import type { KissWorker } from "./KissWorker.js";
import { KissWorkerImpl } from "./KissWorkerImpl.js";
import type { serve } from "./serve.js";

/**
 * Creates a new anonymous class implementing the {@linkcode KissWorker} interface and returns the constructor function.
 * @description Compared to {@linkcode implementWorker}, this function covers the following additional requirements:
 * - The constructor function returned by {@linkcode implementWorkerExternal} can be executed on **any** thread.
 * - The code of the worker function is only ever loaded on the worker thread. This can become important when the amount
 * of code of the worker function is significant, such that you'd rather not load it on the thread calling
 * {@linkcode KissWorker.execute}. Build tools like [vite](vitejs.dev) support this use case by detecting
 * `new Worker(...)` calls and putting the worker script as well as all directly and indirectly called code into a
 * separate chunk. Please see [this example](https://github.com/andreashuber69/kiss-worker-demo2) for more information.
 * @param createWorker A function that creates a new [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
 * with every call. This function **must** create a worker running a script different from the one it is created in.
 * Said script must call {@linkcode serve} passing a function the type of which is then passed to this function.
 * Since TypeScript does not enforce that a type argument must be supplied for a non-default function
 * type parameter, the type of this parameter is such that the compiler will complain about the argument not being
 * assignable to `never` if the calling code does not supply the type of the worker function, see
 * [this SO question](https://stackoverflow.com/questions/70039081/strict-type-argument-when-calling-generic-function)
 * for more information.
 * @returns The constructor function of an anonymous class implementing the {@linkcode KissWorker} interface.
 * @typeParam WorkerFunction The type of the worker function. {@linkcode KissWorker.execute} will have an equivalent
 * signature. NOTE: The caller **must** pass an argument for this parameter, otherwise the argument for `createWorker`
 * will not be accepted.
 */
export const implementWorkerExternal = <WorkerFunction extends (...args: never[]) => unknown = never>(
    createWorker: WorkerFunction extends never ? never : () => DedicatedWorker,
): new () => KissWorker<WorkerFunction> =>
    class extends KissWorkerImpl<WorkerFunction> {
        public constructor() {
            super(createWorker());
        }
    };
