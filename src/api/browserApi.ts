const addEventListenerLocal = addEventListener;
const postMessageLocal = postMessage;
const WorkerLocal = Worker;

const isWorker = () => typeof WorkerGlobalScope !== "undefined" &&
    /* istanbul ignore next -- @preserve */
    self instanceof WorkerGlobalScope;

export {
    addEventListenerLocal as addEventListener,
    isWorker,
    postMessageLocal as postMessage,
    WorkerLocal as Worker,
};
