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
            this.#currentReject(new TypeError(`${ev}`));
        }

        this.#resetHandlers();
    };

    readonly #onError = (ev: ErrorEvent) => {
        if (this.#currentReject) {
            this.#currentReject(new Error(`${ev}`));
        }

        this.#resetHandlers();
    };

    #resetHandlers() {
        this.#currentResolve = undefined;
        this.#currentReject = undefined;
    }
}

const isWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;

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
        onmessage = async (ev: MessageEvent<Parameters<T>>) => postMessage(await func(...ev.data));
    }

    return class extends SimpletonWorker<T> {
        public constructor() {
            super(createWorker());
        }
    };
};

