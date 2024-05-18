// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import type { implementObjectWorker } from "./implementObjectWorker.js";
import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";
import type { ObjectInfo } from "./ObjectInfo.js";
import type { ObjectWorker } from "./ObjectWorker.js";
import { ObjectWorkerImpl } from "./ObjectWorkerImpl.js";
import type { serveObject } from "./serveObject.js";

/**
 * Creates a factory function returning an object implementing the {@linkcode ObjectWorker} interface.
 * @description Compared to {@linkcode implementObjectWorker}, {@linkcode implementObjectWorkerExternal} covers the
 * following additional requirements:
 * - The factory function returned by {@linkcode implementObjectWorkerExternal} can be executed on **any** thread.
 * - The code of the served object is only ever loaded on the worker thread. This can become important when the
 * amount of code running on the worker thread is significant, such that you'd rather not load it anywhere else. Build
 * tools like [vite](vitejs.dev) support this use case by detecting `new Worker(...)` calls and putting the worker
 * script as well as all directly and indirectly called code into a separate chunk. Please see
 * [this example](https://github.com/andreashuber69/kiss-worker-demo4) for more information.
 * @param createWorker A function that creates a new [`Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
 * with every call. This function **must** create a worker running a script different from the one it is created in.
 * The script must call {@linkcode serveObject} passing a constructor function and export the type of the object.
 * @param _info An instance of {@linkcode ObjectInfo} instantiated with the type exported by the script running on the
 * worker thread.
 * @returns The factory function returning an object implementing the {@linkcode ObjectWorker} interface.
 */
export const implementObjectWorkerExternal = <C extends new (..._: never[]) => T, T extends MethodsOnlyObject<T>>(
    createWorker: () => DedicatedWorker,
    _info: ObjectInfo<C, T>,
): (...args: ConstructorParameters<C>) => Promise<ObjectWorker<T>> => async (...args: ConstructorParameters<C>) =>
    await ObjectWorkerImpl.create<C, T>(createWorker, ...args);
