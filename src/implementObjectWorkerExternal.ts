// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import type { implementObjectWorker } from "./implementObjectWorker.js";
import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";
import type { ObjectInfo } from "./ObjectInfo.js";
import type { ObjectWorker } from "./ObjectWorker.js";
import { ObjectWorkerImpl } from "./ObjectWorkerImpl.js";
import type { serveObject } from "./serveObject.js";

/**
 * Provides a function returning an object implementing the {@linkcode ObjectWorker} interface.
 * @description Compared to {@linkcode implementObjectWorker}, {@linkcode implementObjectWorkerExternal} covers the
 * following additional requirements:
 * - The function returned by {@linkcode implementObjectWorkerExternal} can be executed on **any** thread.
 * - The code of the served object is only ever loaded on the worker thread. This can become important when the amount
 * of code of the served object is significant, such that you'd rather not load it on the thread calling
 * {@linkcode ObjectWorker.obj}. Build tools like [vite](vitejs.dev) support this use case by detecting
 * `new Worker(...)` calls and putting the worker script as well as all directly and indirectly called code into a
 * separate chunk. Please see [this example](https://github.com/andreashuber69/kiss-worker-demo2) for more information.
 * @param createWorker A function that creates a new [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
 * with every call. This function **must** create a worker running a script different from the one it is created in.
 * The script must call {@linkcode serveObject} passing a constructor function and export the type of the object.
 * @param info An instance of {@linkcode ObjectInfo} instantiated with the type exported by the script running on the
 * worker thread.
 * @returns The function returning an object implementing the {@linkcode ObjectWorker} interface.
 */
export const implementObjectWorkerExternal = <C extends new (...args: never[]) => T, T extends MethodsOnlyObject<T>>(
    createWorker: () => DedicatedWorker,
    info: ObjectInfo<C, T>,
): (...args2: ConstructorParameters<C>) => Promise<ObjectWorker<T>> => async (...args2: ConstructorParameters<C>) => {
    const result = new ObjectWorkerImpl<C, T>(createWorker, info);

    try {
        await result.construct(...args2);
        return result;
    } catch (error: unknown) {
        result.terminate();
        throw error;
    }
};
