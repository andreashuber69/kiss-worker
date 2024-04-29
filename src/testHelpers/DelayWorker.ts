// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementFunctionWorker } from "../implementFunctionWorker.js";

const delay = async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms));

export const DelayWorker =
    implementFunctionWorker(() => new Worker(new URL("DelayWorker.js", import.meta.url), { type: "module" }), delay);
