// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementFunctionWorker, Worker } from "../index.ts";

export const createUniversalFunctionWorker = implementFunctionWorker(
    () => new Worker(new URL("createUniversalFunctionWorker.ts", import.meta.url), { type: "module" }),
    (fun: () => unknown) => fun(),
);
