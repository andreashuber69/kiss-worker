// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import { implementObjectWorkerExternal, ObjectInfo, Worker } from "../index.ts";
import type { Calculator } from "./Calculator.ts";

export const createCalculatorWorkerExternal = implementObjectWorkerExternal(
    () => new Worker(new URL("Calculator.ts", import.meta.url), { type: "module" }),
    new ObjectInfo<typeof Calculator>(),
);
