// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementObjectWorkerExternal } from "../implementObjectWorkerExternal.js";
import { ObjectInfo } from "../ObjectInfo.js";
import type { CalculatorExternal } from "./CalculatorExternal.js";

export const createCalculatorWorkerExternal = implementObjectWorkerExternal(
    () => new Worker(new URL("CalculatorExternal.js", import.meta.url), { type: "module" }),
    new ObjectInfo<typeof CalculatorExternal>("add", "subtract", "format"),
);
