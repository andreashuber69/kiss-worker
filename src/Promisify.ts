
export type Promisify<T extends Record<keyof T, (...args: never[]) => unknown>> = {
    [K in keyof T]: (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>;
};
