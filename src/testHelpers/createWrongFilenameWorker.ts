// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementFunctionWorker } from "../implementFunctionWorker.js";

export const createWrongFilenameWorker =
    implementFunctionWorker(() => new Worker(new URL("Oops.js", import.meta.url), { type: "module" }), () => undefined);
