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
            this[key as string] = (async (...args: Parameters<Proxy<T>[keyof T]>) => {
                const args2 = ["call", key, ...args] as Parameters<CallSignature<T>>;
                return await this.#worker.execute(...args2);
            }) as Proxy<T>[keyof T];
        }
    }

    readonly #worker: FunctionWorker<WorkerSignature<C, T>>;
}

export class ObjectWorkerImpl<C extends new (...args: never[]) => T, T extends MethodsOnlyObject<T>> {
    public constructor(createWorker: () => DedicatedWorker, info: ObjectInfo<C, T>) {
        const createFunctionWorker =
            implementFunctionWorkerExternal(createWorker, new FunctionInfo<WorkerSignature<C, T>>());

        this.#worker = createFunctionWorker();
        this.obj = new ProxyImpl(this.#worker, info) as unknown as Proxy<T>;
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
