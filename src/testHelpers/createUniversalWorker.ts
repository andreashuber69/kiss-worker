// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementFunctionWorker } from "../implementFunctionWorker.js";

const callFunction = (fun: () => unknown) => fun();

export const createUniversalWorker = implementFunctionWorker(
    () => new Worker(new URL("createUniversalWorker.js", import.meta.url), { type: "module" }),
    callFunction,
);
