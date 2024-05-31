// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { MethodsOnlyObject } from "./MethodsOnlyObject.ts";

/**
 * A type with async equivalents of the methods declared on `T`.
 * @description Contains only the methods with string identifiers, methods identified by numbers or symbols will not
 * appear.
 */
export type Proxy<T extends MethodsOnlyObject<T>> = {
    [K in Extract<keyof T, string>]: (...args: Parameters<T[K]>) => Promise<Awaited<ReturnType<T[K]>>>;
};
