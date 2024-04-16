// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
export interface IWorker {
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
