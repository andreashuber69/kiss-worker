// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { implementFunctionWorkerExternal } from "./implementFunctionWorkerExternal.js";

/**
 * Serves `func` on a worker thread such that it can be called from the thread calling
 * {@linkcode implementFunctionWorkerExternal}.
 * @description This function must only be called from code executing on a worker thread, see example in the
 * {@linkcode implementFunctionWorkerExternal} documentation.
 * @param func The function to serve.
 */
export const serveFunction = <T extends (...args: never[]) => unknown>(func: T) => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    onmessage = async (ev: MessageEvent<Parameters<T>>) => {
        try {
            // We cannot know whether func is synchronous or asynchronous, we therefore must always await
            // the result.
            postMessage({ type: "result", result: await func(...ev.data) });
        } catch (error: unknown) {
            postMessage({ type: "error", error });
        }
    };
};
