// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { serveFunction } from "../serveFunction.js";

const getFibonacciExternal =
    (n: number): number => ((n < 2) ? Math.floor(n) : getFibonacciExternal(n - 1) + getFibonacciExternal(n - 2));

serveFunction(getFibonacciExternal);

// False positive
// eslint-disable-next-line @typescript-eslint/no-use-before-define
export type { getFibonacciExternal };
