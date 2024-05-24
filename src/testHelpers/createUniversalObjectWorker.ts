// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementFunctionWorker, Worker } from "../index.js";

export interface Obj {
    execute: () => void;
}

export const createUniversalObjectWorker = implementFunctionWorker(
    () => new Worker(new URL("createUniversalObjectWorker.js", import.meta.url), { type: "module" }),
    (obj: Obj, method: keyof Obj) => obj[method](),
);
