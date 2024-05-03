// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";

/** Returns a type with async equivalents of the methods declared on `T`. */
export type Promisify<T extends MethodsOnlyObject<T>> = {
    [K in keyof T]: (...args: Parameters<T[K]>) => Promise<Awaited<ReturnType<T[K]>>>;
};
