// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { ExtendedFunctionParameters } from "./ExtendedFunctionParameters.js";
import type { implementObjectWorkerExternal } from "./implementObjectWorkerExternal.js";

/**
 * Calls `ctor` and serves the returned object on a worker thread such that its methods can be called from
 * the thread calling {@linkcode implementObjectWorkerExternal}.
 * @description This function must only be called from code executing on a worker thread, see example in the
 * {@linkcode implementObjectWorkerExternal} documentation.
 * @param ctor The constructor of the worker object to serve.
 */
export const serveObject = <T extends Record<keyof T, (...args: never[]) => unknown>>(
    ctor: new () => T,
) => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    const obj = new ctor();

    /* istanbul ignore next -- @preserve */
    onmessage = async (ev: MessageEvent<ExtendedFunctionParameters<T>>) => {
        try {
            const [methodName, ...args] = ev.data;

            postMessage({
                type: "result",
                // We cannot know whether the called method is synchronous or asynchronous, we therefore must always
                // await the result.
                result: await obj[methodName](...args),
            });
        } catch (error: unknown) {
            postMessage({
                type: "error",
                error,
            });
        }
    };
};
