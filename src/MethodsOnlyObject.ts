// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
export type MethodsOnlyObject<T> = Record<keyof T, (...args: never[]) => unknown>;
