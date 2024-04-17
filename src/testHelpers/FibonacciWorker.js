// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementWorker } from "../..";

const getFibonacci =
    (n) => ((n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2));

export const FibonacciWorker = implementWorker(
    () => new Worker(new URL("FibonacciWorker.js", import.meta.url), { type: "module" }),
    getFibonacci,
);