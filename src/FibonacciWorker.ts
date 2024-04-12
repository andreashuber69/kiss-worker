import { implementWorker } from "./implementWorker.js";

const getFibonacci = (n: number): number => ((n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2));

export const FibonacciWorker =
    implementWorker(() => new Worker(new URL(import.meta.url), { type: "module" }), getFibonacci);
