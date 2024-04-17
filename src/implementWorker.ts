// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import { implementWorkerExternal } from "./implementWorkerExternal.js";
import type { KissWorker } from "./KissWorker.js";
import { serve } from "./serve.js";

const isWorker = typeof WorkerGlobalScope !== "undefined" &&
    /* istanbul ignore next -- @preserve */
    self instanceof WorkerGlobalScope;

/**
 * Creates a new anonymous class implementing the {@linkcode KissWorker} interface and returns the constructor function.
 * @description This function covers the simple and most common use case shown in the example below.
 * A worker is implemented in a single file (`FibonacciWorker.js`), which is then imported into code running on the main
 * thread (see `script` tag in `index.html`).
 * @param createWorker A function that creates a new dedicated worker with every call. This function **must** create a
 * worker running the script it is declared in. In the example below, the `createWorker` argument refers to
 * `FibonacciWorker.js` while being declared in said file.
 * @param func The function that should be executed on the worker thread with each call to
 * {@linkcode KissWorker.execute}.
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
    func: T,
): new () => KissWorker<T> => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    if (func && isWorker) {
        serve(func);
    }

    // It appears that the only alternative to casting here is typing the parameter accordingly but that would
    // unnecessarily pollute the interface.
    return implementWorkerExternal<T>(createWorker as T extends never ? never : () => DedicatedWorker);
};
