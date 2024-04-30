// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import type { ExtendedFunctionParameters } from "./ExtendedFunctionParameters.js";
import type { FunctionWorker } from "./FunctionWorker.js";
import type { ObjectDescriptor } from "./getObjectDescriptor.js";
import { implementFunctionWorkerExternal } from "./implementFunctionWorkerExternal.js";
import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";
import type { Promisify } from "./Promisify.js";

type ExtendedFunction<T extends MethodsOnlyObject<T>> =
    (...args: ExtendedFunctionParameters<T>) => ReturnType<T[keyof T]>;

class Proxy<T extends MethodsOnlyObject<T>> {
    [key: string]: (...args: Parameters<T[keyof T]>) => Promise<ReturnType<T[keyof T]>>;

    public constructor(worker: FunctionWorker<ExtendedFunction<T>>, descriptor: ObjectDescriptor<T>) {
        this.#worker = worker;

        for (const key of descriptor.methodNames) {
            if (key !== "constructor") {
                this[key as string] =
                    async (...args: Parameters<T[keyof T]>) => await this.#worker.execute(key, ...args);
            }
        }
    }

    readonly #worker: FunctionWorker<ExtendedFunction<T>>;
}

export abstract class ObjectWorkerImpl<T extends MethodsOnlyObject<T>> {
    public readonly obj: Promisify<T>;

    public terminate() {
        this.#worker.terminate();
    }

    protected constructor(createWorker: () => DedicatedWorker, descriptor: ObjectDescriptor<T>) {
        const Worker = implementFunctionWorkerExternal<ExtendedFunction<T>>(createWorker);
        this.#worker = new Worker();
        this.obj = new Proxy(this.#worker, descriptor) as unknown as Promisify<T>;
    }

    readonly #worker: FunctionWorker<ExtendedFunction<T>>;
}
