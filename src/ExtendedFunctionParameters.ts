// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
export type ExtendedFunctionParameters<T> = {
    [K in keyof T]: T[K] extends (...args: never[]) => unknown ? [K, ...Parameters<T[K]>] : never;
}[keyof T];
