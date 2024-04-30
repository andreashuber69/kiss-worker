import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";

// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
export type Promisify<T extends MethodsOnlyObject<T>> = {
    [K in keyof T]: (...args: Parameters<T[K]>) => Promise<Awaited<ReturnType<T[K]>>>;
};
