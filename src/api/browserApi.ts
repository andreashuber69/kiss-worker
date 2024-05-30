const addEventListenerLocal = addEventListener;
const postMessageLocal = postMessage;
const WorkerLocal = Worker;

const isWorker = () => typeof WorkerGlobalScope !== "undefined" &&
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    self instanceof WorkerGlobalScope;

const getCause = (error: object) => {
    const { message, filename, lineno } = error as Record<string, unknown>;
    return { message, filename, lineno };
};

const isInvalidWorkerFile = (cause: object) => !("filename" in cause) || !cause.filename;

export {
    addEventListenerLocal as addEventListener,
    isWorker,
    postMessageLocal as postMessage,
    WorkerLocal as Worker,
    getCause,
    isInvalidWorkerFile,
};
