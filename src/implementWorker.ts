// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { PromiseQueue } from "./PromiseQueue.js";

abstract class SimpletonWorker<T extends (...args: never[]) => unknown> {
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
        this.#worker.removeEventListener("message", this.#onMessage);
        this.#worker.removeEventListener("messageerror", this.#onMessageError);
        this.#worker.removeEventListener("error", this.#onError);
        this.#worker.terminate();
    }

    protected constructor(worker: IWorker<MessageEvent<Awaited<ReturnType<T>>>>) {
        this.#worker = worker;
        this.#worker.addEventListener("message", this.#onMessage);
        this.#worker.addEventListener("messageerror", this.#onMessageError);
        this.#worker.addEventListener("error", this.#onError);
    }

    readonly #worker: IWorker<MessageEvent<Awaited<ReturnType<T>>>>;
    readonly #queue = new PromiseQueue();
    #currentResolve: ((value: Awaited<ReturnType<T>>) => void) | undefined;
    #currentReject: ((reason: unknown) => void) | undefined;

    readonly #onMessage = (ev: MessageEvent<Awaited<ReturnType<T>>>) => {
        if (this.#currentResolve) {
            this.#currentResolve(ev.data);
        }

        this.#resetHandlers();
    };

    readonly #onMessageError = (ev: MessageEvent) => {
        if (this.#currentReject) {
            this.#currentReject(new TypeError(JSON.stringify(ev)));
        }

        this.#resetHandlers();
    };

    readonly #onError = (ev: ErrorEvent) => {
        if (this.#currentReject) {
            this.#currentReject(new Error(JSON.stringify(ev)));
        }

        this.#resetHandlers();
    };

    #resetHandlers() {
        this.#currentResolve = undefined;
        this.#currentReject = undefined;
    }
}

const isWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;

const getResult = async (func: () => unknown) => {
    try {
        // The func argument can either be synchronous or asynchronous, we therefore must always await the result
        // eslint-disable-next-line @typescript-eslint/return-await
        return await func();
    } catch (error: unknown) {
        console.log(error);

        // https://stackoverflow.com/questions/39992417/how-to-bubble-a-web-worker-error-in-a-promise-via-worker-onerror
        setTimeout(() => {
            throw error;
        });

        throw error;
    }
};

export interface IWorker<T> {
    addEventListener:
        ((event: "error", listener: (err: ErrorEvent) => void) => void) &
        ((event: "message", listener: (value: T) => void) => void) &
        ((event: "messageerror", listener: (value: MessageEvent) => void) => void);

    removeEventListener:
        ((event: "error", listener: (err: ErrorEvent) => void) => void) &
        ((event: "message", listener: (value: T) => void) => void) &
        ((event: "messageerror", listener: (value: MessageEvent) => void) => void);

    postMessage: (message: unknown) => void;
    terminate: () => void;
}

export const implementWorker = <T extends (...args: never[]) => unknown>(
    createWorker: () => IWorker<MessageEvent<Awaited<ReturnType<T>>>>,
    func: T | undefined = undefined,
) => {
    if (func && isWorker) {
        onmessage = async (ev: MessageEvent<Parameters<T>>) => postMessage(await getResult(() => func(...ev.data)));
    }

    return class extends SimpletonWorker<T> {
        public constructor() {
            super(createWorker());
        }
    };
};

