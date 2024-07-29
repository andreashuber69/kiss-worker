// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import type { DedicatedWorker } from "./DedicatedWorker.ts";
import { FunctionInfo } from "./FunctionInfo.ts";
import type { FunctionWorker } from "./FunctionWorker.ts";
import { implementFunctionWorkerExternal } from "./implementFunctionWorkerExternal.ts";
import type { MethodsOnlyObject } from "./MethodsOnlyObject.ts";
import type { Proxy } from "./Proxy.ts";
import type { CallSignature, WorkerSignature } from "./Signature.ts";

class ProxyImpl<C extends new (..._: never[]) => T, T extends MethodsOnlyObject<T>> {
    [key: string]: Proxy<T>[keyof Proxy<T>];

    public constructor(
        worker: FunctionWorker<WorkerSignature<C, T>>,
        propertyNames: ReadonlyArray<Extract<keyof T, string>>,
    ) {
        this.#worker = worker;

        for (const key of propertyNames) {
            // The cast-fest below is necessary because there seems to be no way to transform the type of args to the
            // parameter types of #worker.execute. The same goes for the type of the function.
            this[key as string] = (async (...args: Parameters<Proxy<T>[keyof Proxy<T>]>) =>
                await this.#worker.execute(...(["call", key, ...args] as Parameters<CallSignature<T>>))
            ) as Proxy<T>[keyof Proxy<T>];
        }
    }

    readonly #worker: FunctionWorker<WorkerSignature<C, T>>;
}

export class ObjectWorkerImpl<C extends new (..._: never[]) => T, T extends MethodsOnlyObject<T>> {
    public static async create<C extends new (..._: never[]) => T, T extends MethodsOnlyObject<T>>(
        createWorker: () => DedicatedWorker,
        ...args: ConstructorParameters<C>
    ) {
        const result = new ObjectWorkerImpl<C, T>(createWorker);

        try {
            await result.construct(...args);
        } catch (error: unknown) {
            result.terminate();
            throw error;
        }

        return result;
    }

    public get obj() {
        return this.#obj;
    }

    public terminate() {
        this.#worker.terminate();
    }


    private constructor(createWorker: () => DedicatedWorker) {
        const createFunctionWorker =
            implementFunctionWorkerExternal(createWorker, new FunctionInfo<WorkerSignature<C, T>>());

        this.#worker = createFunctionWorker();
        // Admittedly, this isn't pretty, but seems to be the only way how we can convince the compiler that obj will
        // never be undefined without additional runtime checks.
        this.#obj = undefined as unknown as Proxy<T>;
    }

    readonly #worker: FunctionWorker<WorkerSignature<C, T>>;
    #obj: Proxy<T>;

    private async construct(...args: ConstructorParameters<C>) {
        const propertyNames =
            await this.#worker.execute("construct", ...args) as ReadonlyArray<Extract<keyof T, string>>;

        this.#obj = new ProxyImpl<C, T>(this.#worker, propertyNames) as unknown as Proxy<T>;
    }
}
