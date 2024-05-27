import type { WorkerOptions } from "node:worker_threads";
import { isMainThread, parentPort, Worker } from "node:worker_threads";

// None of the following code will ever be executed in a browser and therefore should be excluded from istanbul
// coverage.
/* istanbul ignore next -- @preserve */
const addEventListener = (type: "message", listener: (ev: MessageEvent) => unknown) => {
    parentPort?.addListener(type, (value: unknown) => listener({ data: value } as unknown as MessageEvent));
};

/* istanbul ignore next -- @preserve */
const isWorker = () => !isMainThread;

/* istanbul ignore next -- @preserve */
const postMessage = (message: unknown) => parentPort?.postMessage({ data: message });

/* istanbul ignore next -- @preserve */
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

/* istanbul ignore next -- @preserve */
const getCause = (error: object) => error;

/* istanbul ignore next -- @preserve */
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
