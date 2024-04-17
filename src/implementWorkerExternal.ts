// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import type { implementWorker } from "./implementWorker.js";
import type { KissWorker } from "./KissWorker.js";
import { KissWorkerImpl } from "./KissWorkerImpl.js";

/**
 * Creates a new anonymous class implementing the {@linkcode KissWorker} interface and returns the constructor function.
 * @description Compared to {@linkcode implementWorker}, this function covers the following additional requirements:
 * - The constructor function returned by {@linkcode implementWorkerExternal} can be executed on **any** thread.
 * - The code of the worker function is only ever loaded on the worker thread. This can become important when the amount
 * of code of the worker function is significant, such that you'd rather not load it on the thread calling
 * {@linkcode KissWorker.execute}. Build tools like [vite](vitejs.dev) support this use case by detecting
 * `new Worker(...)` calls and putting the worker script as well as all directly and indirectly called code into a
 * separate chunk.
 * @param createWorker A function that creates a new dedicated worker with every call.
 * Since TypeScript does not enforce that a type argument must be supplied for a non-default function type parameter,
 * the type of this parameter is such that the compiler will complain about the argument not being assignable to `never`
 * if the calling code does not supply the type of the worker function, see
 * [this SO question](https://stackoverflow.com/questions/70039081/strict-type-argument-when-calling-generic-function)
 * for more information.
 * @returns The constructor function of an anonymous class implementing the {@linkcode KissWorker} interface.
 * @example
 * // FibonacciWorker.ts
 * import { implementWorkerExternal } from "kiss-worker";
 * import type { getFibonacci } from "./getFibonacci.js";
 *
 * export const FibonacciWorker = implementWorkerExternal<typeof getFibonacci>(
 *     () => new Worker(new URL("getFibonacci.js", import.meta.url), { type: "module" }),
 * );
 *
 *
 * // getFibonacci.ts
 * import { serve } from "kiss-worker";
 *
 * const getFibonacci =
 *     (n: number): number => ((n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2));
 *
 * serve(getFibonacci);
 *
 * export { getFibonacci };
 *
 *
 * // someFunction.ts
 * import { FibonacciWorker } from "./FibonacciWorker.ts";
 *
 * const worker = new FibonacciWorker();
 *
 * const someFunction = () => {
 *     // ...
 *     const result = worker.execute(42);
 *     // ...
 * };
 */
export const implementWorkerExternal = <T extends (...args: never[]) => unknown = never>(
    createWorker: T extends never ? never : () => DedicatedWorker,
): new () => KissWorker<T> =>
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    class extends KissWorkerImpl<T> {
        public constructor() {
            super(createWorker());
        }
    };
