export type ExtendedFunctionParameters<T> = {
    [K in keyof T]: T[K] extends (...args: never[]) => unknown ? [K, ...Parameters<T[K]>] : never;
}[keyof T];
