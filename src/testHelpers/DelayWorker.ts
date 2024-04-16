// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementWorker } from "../implementWorker.js";

const delay = async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms));

export const DelayWorker =
    implementWorker(() => new Worker(new URL("DelayWorker.js", import.meta.url), { type: "module" }), delay);
