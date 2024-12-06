// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import { implementObjectWorker, Worker } from "../index.ts";

class Throwing {
    public constructor(doThrow: boolean) {
        if (doThrow) {
            throw new Error("Oopsie in constructor.");
        }
    }

    public throw() {
        throw new Error("Oopsie in method.");
    }
}

export const createThrowingWorker = implementObjectWorker(
    () => new Worker(
        new URL("createThrowingWorker.ts", import.meta.url),
        { type: "module" },
    ),
    Throwing,
);
