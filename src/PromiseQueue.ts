// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

export class PromiseQueue {
    public async execute<T>(createAwaitable: () => Promise<T>) {
        const resultPromise = PromiseQueue.push(this.pendingPromise, createAwaitable);
        this.pendingPromise = resultPromise;

        try {
            return await resultPromise;
        } finally {
            if (resultPromise === this.pendingPromise) {
                // We only get here if this function has not been called again while we were waiting for
                // resultPromise to settle. We therefore no longer need to hold on to pendingPromise.
                this.pendingPromise = undefined;
            }
        }
    }

    private static async push<T>(current: Promise<unknown> | undefined, createNext: () => Promise<T>) {
        try {
            await current;
        } catch {
            // Intentionally empty. If await current throws, the exception can be caught by the previous caller of
            // execute(). Here we simply need to wait for it to settle so that we can proceed to create the next
            // Promise.
        }

        return await createNext();
    }

    private pendingPromise: Promise<unknown> | undefined;
}
