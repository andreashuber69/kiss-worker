// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { PromiseQueue } from "./PromiseQueue.js";

interface ExecuteResult<T> {
    type: "result";
    result: T;
}

interface ExecuteError {
    type: "error";
    error: Error;
}

type Message<T> = ExecuteError | ExecuteResult<T>;

abstract class KissWorker<T extends (...args: never[]) => unknown> {
    public async execute(...args: Parameters<T>) {
        return await this.#queue.execute(
            async () => await new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
                this.#currentResolve = resolve;
                this.#currentReject = reject;
                // False positive
                // eslint-disable-next-line unicorn/require-post-message-target-origin
                this.#worker.postMessage(args);
            }),
        );
    }

    public terminate() {
        // Allow terminate() to be called multiple times
        if (this.#workerImpl) {
            this.#workerImpl.removeEventListener("message", this.#onMessage);
            this.#workerImpl.removeEventListener("messageerror", this.#onError);
            this.#workerImpl.removeEventListener("error", this.#onError);
            this.#workerImpl.terminate();
            this.#workerImpl = undefined;
        }
    }

    protected constructor(worker: IWorker<T>) {
        this.#workerImpl = worker;
        this.#worker.addEventListener("message", this.#onMessage);
        this.#worker.addEventListener("messageerror", this.#onError);
        this.#worker.addEventListener("error", this.#onError);
    }

    readonly #queue = new PromiseQueue();
    #workerImpl: IWorker<T> | undefined;
    #currentResolve: ((value: Awaited<ReturnType<T>>) => void) | undefined;
    #currentReject: ((reason: unknown) => void) | undefined;

    get #worker() {
        if (!this.#workerImpl) {
            throw new Error("The worker has been terminated.");
        }

        return this.#workerImpl;
    }

    readonly #onMessage = (ev: MessageEvent) => {
        if (!this.#currentResolve || !this.#currentReject) {
            throw new Error("The worker function called postMessage, which is not allowed.");
        }

        // We're deliberately casting (as opposed to typing the parameter accordingly) to avoid TS4023. This error
        // appears because TypeScript puts # private properties in the .d.ts files and code importing the type would
        // thus need to "see" the associated parameter types.
        const { data } = ev as MessageEvent<Message<Awaited<ReturnType<T>>>>;

        if (data.type === "result") {
            this.#currentResolve(data.result);
        } else if (data.type === "error") {
            this.#currentReject(data.error);
        }

        this.#resetHandlers();
    };

    readonly #onError = (ev: Event) => {
        const prefix = `Unexpected error in worker: ${JSON.stringify(ev)}!`;

        // With a little bit of imagination, a worker function can do all kinds of funny stuff, e.g.
        // https://stackoverflow.com/questions/39992417/how-to-bubble-a-web-worker-error-in-a-promise-via-worker-onerror
        // We do our best to bring it to the attention of the caller.
        if (this.#currentReject) {
            const msg =
                `${prefix} Argument deserialization failed or exception occurred outside of the worker function`;

            this.#currentReject(new Error(msg));
        } else {
            throw new Error(`${prefix} Exception occurred outside of the worker function!`);
        }

        this.#resetHandlers();
    };

    #resetHandlers() {
        this.#currentResolve = undefined;
        this.#currentReject = undefined;
    }
}

const isWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;

export interface IWorker<T extends (...args: never[]) => unknown> {
    addEventListener:
        ((event: "error", listener: (err: ErrorEvent) => void) => void) &
        ((event: "message", listener: (value: MessageEvent) => void) => void) &
        ((event: "messageerror", listener: (value: MessageEvent) => void) => void);

    removeEventListener:
        ((event: "error", listener: (err: ErrorEvent) => void) => void) &
        ((event: "message", listener: (value: MessageEvent) => void) => void) &
        ((event: "messageerror", listener: (value: MessageEvent) => void) => void);

    postMessage: (args: Parameters<T>) => void;
    terminate: () => void;
}

export const implementWorker = <T extends (...args: never[]) => unknown>(
    createWorker: () => IWorker<T>,
    func: T | undefined = undefined,
) => {
    if (func && isWorker) {
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
    }

    return class extends KissWorker<T> {
        public constructor() {
            super(createWorker());
        }
    };
};

