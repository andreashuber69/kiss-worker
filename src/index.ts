// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import type { DedicatedWorker } from "./DedicatedWorker.ts";
import { Worker as WorkerLocal } from "api";

const Worker: new (scriptURL: URL | string, options: { type: "module" }) => DedicatedWorker = WorkerLocal;

export type { AddRemoveEventListener, DedicatedWorker } from "./DedicatedWorker.ts";

export type { FunctionWorker } from "./FunctionWorker.ts";

export { implementFunctionWorker } from "./implementFunctionWorker.ts";

export { implementFunctionWorkerExternal } from "./implementFunctionWorkerExternal.ts";

export { FunctionInfo } from "./FunctionInfo.ts";

export { serveFunction } from "./serveFunction.ts";

export type { ObjectWorker } from "./ObjectWorker.ts";

export type { MethodsOnlyObject } from "./MethodsOnlyObject.ts";

export type { Proxy } from "./Proxy.ts";

export { implementObjectWorker } from "./implementObjectWorker.ts";

export { implementObjectWorkerExternal } from "./implementObjectWorkerExternal.ts";

export { ObjectInfo } from "./ObjectInfo.ts";

export { serveObject } from "./serveObject.ts";

export { Worker };
