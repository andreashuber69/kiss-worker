// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import type { MethodsOnlyObject } from "./MethodsOnlyObject.ts";
import type { Proxy } from "./Proxy.ts";

export type CallSignature<T extends MethodsOnlyObject<T>> = {
    [K in keyof Proxy<T>]: (..._: ["call", K, ...Parameters<Proxy<T>[K]>]) => ReturnType<Proxy<T>[K]>;
}[keyof Proxy<T>];

export type WorkerSignature<C extends new (..._: never[]) => T, T extends MethodsOnlyObject<T>> = CallSignature<T> |
    ((..._: ["construct", ...ConstructorParameters<C>]) => Promise<ReadonlyArray<Extract<keyof T, string>>>);
