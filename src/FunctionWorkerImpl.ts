// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { DedicatedWorker } from "./DedicatedWorker.js";
import { PromiseQueue } from "./PromiseQueue.js";
import { getCause, isInvalidWorkerFile } from "api";

interface ExecuteResult<T> {
    type: "result";
    result: T;
}

interface ExecuteError {
    type: "error";
    error: unknown;
}

type Message<T> = ExecuteError | ExecuteResult<T>;

export class FunctionWorkerImpl<T extends (..._: never[]) => unknown> {
    public constructor(createWorker: () => DedicatedWorker) {
        this.#workerImpl = createWorker();
        this.#workerImpl.addEventListener("message", this.#onMessage);
        this.#workerImpl.addEventListener("messageerror", this.#onMessageError);
        this.#workerImpl.addEventListener("error", this.#onError);
    }

    public async execute(...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
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
            this.#workerImpl.removeEventListener("messageerror", this.#onMessageError);
            this.#workerImpl.removeEventListener("error", this.#onError);
            this.#workerImpl.terminate();
            this.#workerImpl = undefined;
        }
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

    readonly #onMessage = (ev: object) => {
        if (!this.#currentResolve || !this.#currentReject) {
            if (this.#postMessageWasCalled) {
                this.#postMessageWasCalled = false;
            } else {
                console.error("func returned after having an Error thrown outside of the function.");
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
            this.#currentReject(new Error("Client code made a prohibited call to postMessage."));
        }

        this.#resetHandlers();
    };

    readonly #onMessageError = (ev: object) =>
        this.#showError("Argument deserialization failed.", getCause(ev));

    readonly #onError = (ev: object) => {
        const cause = getCause(ev);

        if (isInvalidWorkerFile(cause)) {
            this.#showError("The specified worker file is not a valid script.", cause);
        } else {
            this.#showError("Exception thrown outside of worker message handler.", cause);
        }
    };

    #showError(message: string, cause: object) {
        const error = new Error(message, { cause });

        if (this.#currentReject) {
            this.#currentReject(error);
            this.#resetHandlers();
        } else {
            console.error(JSON.stringify(error));
        }
    }

    #resetHandlers() {
        this.#currentResolve = undefined;
        this.#currentReject = undefined;
    }
}
