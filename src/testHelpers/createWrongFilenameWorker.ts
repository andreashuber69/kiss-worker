// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import { implementFunctionWorker, Worker } from "../index.ts";

export const createWrongFilenameWorker =
    implementFunctionWorker(() => new Worker(new URL("Oops.ts", import.meta.url), { type: "module" }), () => undefined);
