// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementFunctionWorker } from "../implementFunctionWorker.js";

export const createDelayWorker = implementFunctionWorker(
    () => new Worker(new URL("createDelayWorker.js", import.meta.url), { type: "module" }),
    async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms)),
);
