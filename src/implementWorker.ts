// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { IWorker } from "./IWorker.js";
import { KissWorker } from "./KissWorker.js";

const isWorker = typeof WorkerGlobalScope !== "undefined" &&
    /* istanbul ignore next -- @preserve */
    self instanceof WorkerGlobalScope;

export const implementWorker = <T extends (...args: never[]) => unknown>(
    createWorker: () => IWorker,
    func: T | undefined = undefined,
) => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is always loaded.
    /* istanbul ignore next -- @preserve */
    if (func && isWorker) {
        onmessage = async (ev: MessageEvent<Parameters<T>>) => {
            try {
                postMessage({
                    type: "result",
                    // Func can either be synchronous or asynchronous, we therefore must always await the result.
                    result: await func(...ev.data),
                });
            } catch (error: unknown) {
                postMessage({
                    type: "error",
                    error,
                });
            }
        };
    }

    return class extends KissWorker<T> {
        public constructor() {
            super(createWorker());
        }
    };
};
