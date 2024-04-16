// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
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

export abstract class KissWorkerImpl<T extends (...args: never[]) => unknown> {
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

    protected constructor(worker: DedicatedWorker) {
        this.#workerImpl = worker;
        this.#workerImpl.addEventListener("message", this.#onMessage);
        this.#workerImpl.addEventListener("messageerror", this.#onError);
        this.#workerImpl.addEventListener("error", this.#onError);
    }

    readonly #queue = new PromiseQueue();
    #workerImpl: DedicatedWorker | undefined;
    #currentResolve: ((value: Awaited<ReturnType<T>>) => void) | undefined;
    #currentReject: ((reason: unknown) => void) | undefined;
    #postMessageWasCalled = false;

    get #worker() {
        if (!this.#workerImpl) {
            throw new Error("The worker has been terminated.");
        }

        return this.#workerImpl;
    }

    readonly #onMessage = (ev: { data: unknown }) => {
        if (!this.#currentResolve || !this.#currentReject) {
            if (this.#postMessageWasCalled) {
                this.#postMessageWasCalled = false;
            } else {
                console.error(
                    "The worker function returned after having an Error thrown outside of the function, see above.",
                );
            }

            return;
        }

        // We're deliberately casting (as opposed to typing the parameter accordingly) to avoid TS4023. This error
        // appears because TypeScript puts # private properties in the .d.ts files and code importing the type would
        // thus need to "see" the types associated with the parameter type.
        const { data } = ev as { data: Message<Awaited<ReturnType<T>>> };

        if (data.type === "result") {
            this.#currentResolve(data.result);
        } else if (data.type === "error") {
            this.#currentReject(data.error);
        } else {
            this.#postMessageWasCalled = true;
            this.#currentReject(new Error("The worker function called postMessage, which is not allowed."));
        }

        this.#resetHandlers();
    };

    readonly #onError = () => {
        // With a little bit of imagination, a worker function can do all kinds of funny stuff, e.g.
        // https://stackoverflow.com/questions/39992417/how-to-bubble-a-web-worker-error-in-a-promise-via-worker-onerror
        // We do our best to bring it to the attention of the caller.
        if (this.#currentReject) {
            const prefix = "Argument deserialization failed or exception thrown outside of the worker function";
            this.#currentReject(new Error(`${prefix}, see console for details.`));
            this.#resetHandlers();
            console.error(`${prefix}.`);
        } else {
            console.error("Exception thrown after the worker function has returned, see below.");
        }
    };

    #resetHandlers() {
        this.#currentResolve = undefined;
        this.#currentReject = undefined;
    }
}
