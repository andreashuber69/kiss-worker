// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import type { WorkerOptions } from "node:worker_threads";
import { isMainThread, parentPort, Worker } from "node:worker_threads";

const addEventListener = (type: "message", listener: (ev: MessageEvent) => unknown) => {
    // Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
    // version of the code is ever loaded.
    /* istanbul ignore next -- @preserve */
    parentPort?.addListener(type, (value: unknown) => listener({ data: value } as unknown as MessageEvent));
};

const isWorker = () => !isMainThread;

/* istanbul ignore next -- @preserve */
const postMessage = (message: unknown): void => parentPort?.postMessage({ data: message });

class WorkerLocal extends Worker {
    public constructor(filename: URL | string, options: WorkerOptions & { type: "module" }) {
        const workerFilename = filename.toString();

        if (workerFilename.endsWith("ts")) {
            options.workerData ??= {};
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            options.workerData.tsxWorkerFilename = workerFilename;
            super(new URL("TsxWorker.js", import.meta.url), options);
        } else {
            super(filename, options);
        }
    }

    public addEventListener(event: "error" | "message" | "messageerror", listener: (ev: object) => void) {
        this.addListener(event, listener);
    }

    public removeEventListener(event: "error" | "message" | "messageerror", listener: (ev: object) => void) {
        this.removeListener(event, listener);
    }
}

const getCause = (error: object) => error;

const isInvalidWorkerFile = (cause: object) =>
    cause instanceof Error && "code" in cause && cause.code === "ERR_MODULE_NOT_FOUND";

export {
    addEventListener,
    isWorker,
    postMessage,
    WorkerLocal as Worker,
    getCause,
    isInvalidWorkerFile,
};
