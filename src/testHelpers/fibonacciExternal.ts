// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { serveFunction } from "../serveFunction.js";

const fibonacciExternal = (n: number): number =>
    ((n < 2) ? Math.floor(n) : fibonacciExternal(n - 1) + fibonacciExternal(n - 2));

serveFunction(fibonacciExternal);

// False positive
// eslint-disable-next-line @typescript-eslint/no-use-before-define
export type { fibonacciExternal };
