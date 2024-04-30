// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";

export type ExtendedFunctionParameters<T extends MethodsOnlyObject<T>> = {
    [K in keyof T]: [K, ...Parameters<T[K]>];
}[keyof T];
