// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import { KissWorkerImpl } from "./KissWorkerImpl.js";
import { serve } from "./serve.js";

const isWorker = typeof WorkerGlobalScope !== "undefined" &&
    /* istanbul ignore next -- @preserve */
    self instanceof WorkerGlobalScope;

/**
 * Represents the worker thread created by calling the constructor function returned by {@linkcode implementWorker}.
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

/**
 * Creates a new anonymous class implementing the {@linkcode KissWorker} interface and returns the constructor function.
 * @description This function covers two use cases. The simpler and most common one is shown in the first example below.
 * A worker is implemented in a single file (`FibonacciWorker.js`), which is then imported into code running on the main
 * thread (see `script` tag in `index.html`).
 *
 * The second example shows a more complex implementation that covers the following additional requirements:
 * - The constructor function returned by {@linkcode implementWorker} can be executed on **any** thread.
 * - The code of the worker function is only ever loaded on the worker thread. This can become important when the amount
 * of code of the worker function is significant, such that you only want to load it on the worker thread.
 * @param createWorker A function that creates a new dedicated worker with every call.
 * @param func The function that should be executed on the worker thread with each call to
 * {@linkcode KissWorker.execute}. If an argument for this parameter is provided, `createWorker` **must** create a
 * worker running the script it is declared in. In the example below, the `createWorker` argument refers to
 * `FibonacciWorker.js` while being declared in said file.
 * @returns The constructor function of an anonymous class implementing the {@linkcode KissWorker} interface.
 * @example
 * // FibonacciWorker.js
 * import { implementWorker } from "kiss-worker";
 *
 * const getFibonacci =
 *     (n) => ((n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2));
 *
 * export const FibonacciWorker = implementWorker(
 *     () => new Worker(new URL("FibonacciWorker.js", import.meta.url), { type: "module" }),
 *     getFibonacci,
 * );
 *
 *
 * // index.html
 * <!doctype html>
 * <html lang=en>
 *   <head>
 *     <meta charset=utf-8>
 *     <title>kiss-worker Test</title>
 *     <script type="module">
 *       import { FibonacciWorker } from "./FibonacciWorker.js";
 *       const worker = new FibonacciWorker();
 *       document.querySelector("#result").textContent = `${await worker.execute(40)}`;
 *     </script>
 *   </head>
 *   <body>
 *     <h1 id="result"></h1>
 *   </body>
 * </html>
 */
export const implementWorker = <T extends (...args: never[]) => unknown>(
    createWorker: () => DedicatedWorker,
    func: T | undefined = undefined,
): new () => KissWorker<T> => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    if (func && isWorker) {
        serve(func);
    }

    return class extends KissWorkerImpl<T> {
        public constructor() {
            super(createWorker());
        }
    };
};
