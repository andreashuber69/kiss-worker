// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementFunctionWorker } from "../implementFunctionWorker.js";

const getFibonacci = (n: number): number => ((n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2));

export const createGetFibonacciWorker = implementFunctionWorker(
    () => new Worker(new URL("createGetFibonacciWorker.js", import.meta.url), { type: "module" }),
    getFibonacci,
);
