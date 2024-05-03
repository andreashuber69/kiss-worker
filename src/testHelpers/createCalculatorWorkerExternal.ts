// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementObjectWorkerExternal } from "../implementObjectWorkerExternal.js";
import { ObjectInfo } from "../ObjectInfo.js";
import type { Calculator2 } from "./Calculator2.js";

export const createCalculatorWorker = implementObjectWorkerExternal(
    () => new Worker(new URL("Calculator2.js", import.meta.url), { type: "module" }),
    new ObjectInfo<typeof Calculator2>("add", "subtract", "format"),
);
