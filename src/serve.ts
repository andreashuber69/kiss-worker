// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
export const serve = <T extends (...args: never[]) => unknown>(func: T) => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    onmessage = async (ev: MessageEvent<Parameters<T>>) => {
        try {
            postMessage({
                type: "result",
                // Func can either be synchronous or asynchronous, we therefore must always await the result.
                result: await func(...ev.data),
            });
        } catch (error: unknown) {
            postMessage({
                type: "error",
                error,
            });
        }
    };
};
