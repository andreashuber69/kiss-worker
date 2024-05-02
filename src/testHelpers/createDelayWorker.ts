// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementFunctionWorker } from "../implementFunctionWorker.js";

const delay = async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms));

export const createDelayWorker = implementFunctionWorker(
    () => new Worker(new URL("createDelayWorker.js", import.meta.url), { type: "module" }),
    delay,
);
