// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { IWorker } from "./IWorker.js";
import { KissWorker } from "./KissWorker.js";
import { serve } from "./serve.js";

const isWorker = typeof WorkerGlobalScope !== "undefined" &&
    /* istanbul ignore next -- @preserve */
    self instanceof WorkerGlobalScope;

export interface IKissWorker<T extends (...args: never[]) => unknown> {
    execute: (...args: Parameters<T>) => Promise<ReturnType<T>>;
    terminate: () => void;
}

export const implementWorker = <T extends (...args: never[]) => unknown>(
    createWorker: () => IWorker,
    func: T | undefined = undefined,
): new () => IKissWorker<T> => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    if (func && isWorker) {
        serve<T>(func);
    }

    return class extends KissWorker<T> {
        public constructor() {
            super(createWorker());
        }
    };
};
