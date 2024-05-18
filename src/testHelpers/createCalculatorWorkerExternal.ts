// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementObjectWorkerExternal, ObjectInfo } from "kiss-worker";
import type { Calculator } from "./Calculator.js";

export const createCalculatorWorkerExternal = implementObjectWorkerExternal(
    () => new Worker(new URL("Calculator.js", import.meta.url), { type: "module" }),
    new ObjectInfo<typeof Calculator>(),
);
