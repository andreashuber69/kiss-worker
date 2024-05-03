// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import type { ExtendedFunctionParameters } from "./ExtendedFunctionParameters.js";
import { FunctionInfo } from "./FunctionInfo.js";
import type { FunctionWorker } from "./FunctionWorker.js";
import { implementFunctionWorkerExternal } from "./implementFunctionWorkerExternal.js";
import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";
import type { ObjectInfo } from "./ObjectInfo.js";
import type { Promisify } from "./Promisify.js";

type ExtendedFunction<C extends new (...args: never[]) => T, T extends MethodsOnlyObject<T>> =
    (...args: ExtendedFunctionParameters<C, T>) => ReturnType<T[keyof T]>;

class Proxy<C extends new (...args: never[]) => T, T extends MethodsOnlyObject<T>> {
    [key: string]: (...args: Parameters<T[keyof T]>) => Promise<ReturnType<T[keyof T]>>;

    public constructor(worker: FunctionWorker<ExtendedFunction<C, T>>, info: ObjectInfo<C, T>) {
        this.#worker = worker;

        for (const key of info.methodNames) {
            this[key as string] =
                async (...args: Parameters<T[keyof T]>) => await this.#worker.execute("call", key, ...args);
        }
    }

    readonly #worker: FunctionWorker<ExtendedFunction<C, T>>;
}

export class ObjectWorkerImpl<C extends new (...args: never[]) => T, T extends MethodsOnlyObject<T>> {
    public constructor(createWorker: () => DedicatedWorker, info: ObjectInfo<C, T>) {
        const createFunctionWorker =
            implementFunctionWorkerExternal(createWorker, new FunctionInfo<ExtendedFunction<C, T>>());

        this.#worker = createFunctionWorker();
        this.obj = new Proxy(this.#worker, info) as unknown as Promisify<T>;
    }

    public readonly obj: Promisify<T>;

    public terminate() {
        this.#worker.terminate();
    }

    /**
     * Constructs the object on the worker thread.
     * @internal
     */
    public async construct(...args: ConstructorParameters<C>) {
        await this.#worker.execute("construct", ...args);
    }

    readonly #worker: FunctionWorker<ExtendedFunction<C, T>>;
}
