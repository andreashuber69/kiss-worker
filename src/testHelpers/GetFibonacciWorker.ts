// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementWorker } from "../implementWorker.js";

const getFibonacci = (n: number): number => ((n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2));

export const GetFibonacciWorker = implementWorker(
    () => new Worker(new URL("GetFibonacciWorker.js", import.meta.url), { type: "module" }),
    getFibonacci,
);