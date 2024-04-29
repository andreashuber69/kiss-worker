
// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
export type Promisify<T extends Record<keyof T, (...args: never[]) => unknown>> = {
    [K in keyof T]: (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>;
};
