// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementObjectWorkerExternal } from "../implementObjectWorkerExternal.js";
import { info } from "./Calculator.js";

export const CalculatorWorker = implementObjectWorkerExternal(
    () => new Worker(new URL("Calculator.js", import.meta.url), { type: "module" }),
    info,
);
