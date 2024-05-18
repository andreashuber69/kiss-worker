// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementFunctionWorker } from "kiss-worker";

export const createWrongFilenameWorker =
    implementFunctionWorker(() => new Worker(new URL("Oops.js", import.meta.url), { type: "module" }), () => undefined);
