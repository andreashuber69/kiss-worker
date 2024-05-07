// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import { FunctionInfo } from "./FunctionInfo.js";
import type { FunctionWorker } from "./FunctionWorker.js";
import { implementFunctionWorkerExternal } from "./implementFunctionWorkerExternal.js";
import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";
import type { ObjectInfo } from "./ObjectInfo.js";
import type { Proxy } from "./Proxy.js";
import type { CallSignature, WorkerSignature } from "./Signature.js";

class ProxyImpl<C extends new (...args: never[]) => T, T extends MethodsOnlyObject<T>> {
    [key: string]: Proxy<T>[keyof T];

    public constructor(worker: FunctionWorker<WorkerSignature<C, T>>, info: ObjectInfo<C, T>) {
        this.#worker = worker;

        for (const key of info.methodNames) {
            // The cast-fest below is necessary because there seems to be no way to transform the type of args to the
            // parameter types of #worker.execute. The same goes for the type of the function.
            this[key as string] = (async (...args: Parameters<Proxy<T>[keyof T]>) =>
                await this.#worker.execute(...(["call", key, ...args] as Parameters<CallSignature<T>>))
            ) as Proxy<T>[keyof T];
        }
    }

    readonly #worker: FunctionWorker<WorkerSignature<C, T>>;
}

export class ObjectWorkerImpl<C extends new (...args: never[]) => T, T extends MethodsOnlyObject<T>> {
    public constructor(createWorker: () => DedicatedWorker, info: ObjectInfo<C, T>) {
        const createFunctionWorker =
            implementFunctionWorkerExternal(createWorker, new FunctionInfo<WorkerSignature<C, T>>());

        this.#worker = createFunctionWorker();
        this.obj = new ProxyImpl<C, T>(this.#worker, info) as unknown as Proxy<T>;
    }

    public readonly obj: Proxy<T>;

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

    readonly #worker: FunctionWorker<WorkerSignature<C, T>>;
}
