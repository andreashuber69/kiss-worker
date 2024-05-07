// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";
import type { Proxy } from "./Proxy.js";

export type CallSignature<T extends MethodsOnlyObject<T>> = {
    [K in keyof Proxy<T>]: (...args: ["call", K, ...Parameters<Proxy<T>[K]>]) => ReturnType<Proxy<T>[K]>;
}[keyof Proxy<T>];

export type WorkerSignature<C extends new (...args: never[]) => T, T extends MethodsOnlyObject<T>> = CallSignature<T> |
    ((...args: ["construct", ...ConstructorParameters<C>]) => Promise<undefined>);
