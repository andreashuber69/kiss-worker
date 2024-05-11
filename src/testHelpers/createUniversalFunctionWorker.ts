// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementFunctionWorker } from "../implementFunctionWorker.js";

const callFunction = (fun: () => unknown) => fun();

export const createUniversalFunctionWorker = implementFunctionWorker(
    () => new Worker(new URL("createUniversalFunctionWorker.js", import.meta.url), { type: "module" }),
    callFunction,
);
