export const isWorker = () => typeof WorkerGlobalScope !== "undefined" &&
    /* istanbul ignore next -- @preserve */
    self instanceof WorkerGlobalScope;
