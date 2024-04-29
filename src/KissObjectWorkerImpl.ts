// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import type { ExtendedFunctionParameters } from "./ExtendedFunctionParameters.js";
import { implementWorkerExternal } from "./implementWorkerExternal.js";
import type { KissWorker } from "./KissWorker.js";
import type { Promisify } from "./Promisify.js";

type ExtendedFunction<T extends Record<keyof T, (...args: never[]) => unknown>> =
    (...args: ExtendedFunctionParameters<T>) => ReturnType<T[typeof args[0]]>;

type MethodParameters<T extends Record<keyof T, (...args: never[]) => unknown>> = {
    [K in keyof T]: Parameters<T[K]>;
}[keyof T];

class Proxy<T extends Record<keyof T, (...args: never[]) => unknown>> {
    [key: number | string | symbol]: unknown;

    public constructor(worker: KissWorker<ExtendedFunction<T>>, workerClassCtor: new () => T) {
        this.#worker = worker;

        for (const key of Object.getOwnPropertyNames(workerClassCtor.prototype)) {
            if (key !== "constructor") {
                Proxy.prototype[key] = async (...args: MethodParameters<T>) =>
                    await this.#worker.execute(...([key, ...args] as ExtendedFunctionParameters<T>));
            }
        }
    }

    readonly #worker: KissWorker<ExtendedFunction<T>>;
}

export abstract class KissObjectWorkerImpl<T extends Record<keyof T, (...args: never[]) => unknown>> {
    public readonly obj: Promisify<T>;

    public terminate() {
        this.#worker.terminate();
    }

    protected constructor(createWorker: () => DedicatedWorker, workerClassCtor: new () => T) {
        const Worker = implementWorkerExternal<ExtendedFunction<T>>(createWorker);
        this.#worker = new Worker();
        this.obj = new Proxy(this.#worker, workerClassCtor) as unknown as Promisify<T>;
    }

    readonly #worker: KissWorker<ExtendedFunction<T>>;
}
