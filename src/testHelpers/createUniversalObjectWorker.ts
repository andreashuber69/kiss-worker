// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import { implementFunctionWorker, Worker } from "../index.ts";

export interface Obj {
    execute: () => void;
}

export const createUniversalObjectWorker = implementFunctionWorker(
    () => new Worker(new URL("createUniversalObjectWorker.ts", import.meta.url), { type: "module" }),
    (obj: Obj, method: keyof Obj) => obj[method](),
);
