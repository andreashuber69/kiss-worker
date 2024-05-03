// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementObjectWorkerExternal } from "../implementObjectWorkerExternal.js";
import { ObjectInfo } from "../ObjectInfo.js";
import type { Calculator } from "./Calculator.js";

export const createCalculatorWorker = implementObjectWorkerExternal(
    () => new Worker(new URL("Calculator.js", import.meta.url), { type: "module" }),
    new ObjectInfo<typeof Calculator>("add", "subtract", "format"),
);