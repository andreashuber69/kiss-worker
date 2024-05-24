// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementFunctionWorker, Worker } from "../index.js";

export const createWrongFilenameWorker =
    implementFunctionWorker(() => new Worker(new URL("Oops.js", import.meta.url), { type: "module" }), () => undefined);
