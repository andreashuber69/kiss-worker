// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { implementObjectWorkerExternal } from "./implementObjectWorkerExternal.js";
import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";
import type { WorkerSignature } from "./Signature.js";

/**
 * Calls `ctor` and serves the returned object on a worker thread such that its methods can be called from
 * the thread calling {@linkcode implementObjectWorkerExternal}.
 * @description This function must only be called from code executing on a worker thread, see example in the
 * {@linkcode implementObjectWorkerExternal} documentation.
 * @param ctor The constructor function of the worker object to serve.
 */
export const serveObject = <C extends new (...args: never[]) => T, T extends MethodsOnlyObject<T> = InstanceType<C>>(
    ctor: C,
) => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    let obj: T | undefined;

    /* istanbul ignore next -- @preserve */
    onmessage = async ({ data }: MessageEvent<Parameters<WorkerSignature<C, T>>>) => {
        try {
            if (data[0] === "construct") {
                const [, ...args] = data;
                obj = new ctor(...args);
                postMessage({ type: "result", result: undefined });
            } else {
                const [, methodName, ...args] = data;

                // We cannot know whether the called method is synchronous or asynchronous, we therefore must always
                // await the result.
                postMessage({ type: "result", result: await obj?.[methodName](...args) });
            }
        } catch (error: unknown) {
            postMessage({ type: "error", error });
        }
    };
};
