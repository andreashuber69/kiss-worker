// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { serveFunction } from "../serveFunction.js";

const getFibonacci = (n: number): number => ((n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2));

serveFunction(getFibonacci);

export type GetFibonacci = typeof getFibonacci;
