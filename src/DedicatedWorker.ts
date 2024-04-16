// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
/**
 * Exposes the minimal interface of the object returned by the the `createWorker` parameter of the `implementWorker`
 * function.
 * @description This is a subset of the {@link Worker} interface (currently available in browsers only).
 */
export interface DedicatedWorker {
    addEventListener:
        ((event: "error", listener: () => void) => void) &
        ((event: "message", listener: (ev: { data: unknown }) => void) => void) &
        ((event: "messageerror", listener: () => void) => void);

    removeEventListener:
        ((event: "error", listener: () => void) => void) &
        ((event: "message", listener: (ev: { data: unknown }) => void) => void) &
        ((event: "messageerror", listener: () => void) => void);

    postMessage: (args: never[]) => void;
    terminate: () => void;
}
