// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
export type { AddRemoveEventListener, DedicatedWorker } from "./DedicatedWorker.js";

export type { FunctionWorker } from "./FunctionWorker.js";

export { implementFunctionWorker } from "./implementFunctionWorker.js";

export { implementFunctionWorkerExternal } from "./implementFunctionWorkerExternal.js";

export { FunctionInfo } from "./FunctionInfo.js";

export { serveFunction } from "./serveFunction.js";

export type { ObjectWorker } from "./ObjectWorker.js";

export type { MethodsOnlyObject } from "./MethodsOnlyObject.js";

export type { Proxy } from "./Proxy.js";

export { implementObjectWorker } from "./implementObjectWorker.js";

export { implementObjectWorkerExternal } from "./implementObjectWorkerExternal.js";

export { ObjectInfo } from "./ObjectInfo.js";

export { serveObject } from "./serveObject.js";

export { Worker } from "#api";
