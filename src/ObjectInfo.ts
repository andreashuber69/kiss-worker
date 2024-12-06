// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import type { implementObjectWorkerExternal } from "./implementObjectWorkerExternal.ts";
import type { MethodsOnlyObject } from "./MethodsOnlyObject.ts";
import type { serveObject } from "./serveObject.ts";

/**
 * Supplies information to {@linkcode implementObjectWorkerExternal} about the type of the object being served with
 * {@linkcode serveObject}.
 * @typeParam C The type of the constructor function of the object being served with {@linkcode serveObject}.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ObjectInfo<C extends new (..._: never[]) => T, T extends MethodsOnlyObject<T> = InstanceType<C>> {}
