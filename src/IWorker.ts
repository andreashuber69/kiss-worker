// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
export interface IWorker {
    addEventListener:
    ((event: "error", listener: (err: ErrorEvent) => void) => void) &
    ((event: "message", listener: (value: MessageEvent) => void) => void) &
    ((event: "messageerror", listener: (value: MessageEvent) => void) => void);

    removeEventListener:
    ((event: "error", listener: (err: ErrorEvent) => void) => void) &
    ((event: "message", listener: (value: MessageEvent) => void) => void) &
    ((event: "messageerror", listener: (value: MessageEvent) => void) => void);

    postMessage: (args: never[]) => void;
    terminate: () => void;
}
