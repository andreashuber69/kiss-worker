// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";

export type ExtendedFunctionParameters<C extends new (...args: never[]) => T, T extends MethodsOnlyObject<T>> = {
    [K in keyof T]: ["call", K, ...Parameters<T[K]>];
}[keyof T] | ["construct", ...ConstructorParameters<C>];
