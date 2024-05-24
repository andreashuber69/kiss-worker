import type { WorkerOptions } from "node:worker_threads";
import { isMainThread, parentPort, Worker } from "node:worker_threads";

const addEventListener = (type: "message", listener: (ev: MessageEvent) => unknown) => {
    parentPort?.addListener(type, (value: unknown) => listener({ data: value } as unknown as MessageEvent));
};

const isWorker = () => !isMainThread;

const postMessage = (message: unknown) => parentPort?.postMessage({ data: message });

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

    public addEventListener(event: "error" | "message" | "messageerror", listener: (ev: unknown) => void) {
        this.addListener(event, listener);
    }

    public removeEventListener(event: "error" | "message" | "messageerror", listener: (ev: unknown) => void) {
        this.removeListener(event, listener);
    }
}

export {
    addEventListener,
    isWorker,
    postMessage,
    WorkerLocal as Worker,
};
