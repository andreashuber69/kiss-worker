// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { serve } from "../serve.js";

// The function we would like to execute on the worker thread (the worker function).
const getFibonacci =
    (n: number): number => ((n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2));

// Serve the function, so that it can be called from another thread.
serve(getFibonacci);

// Export the function, so that we can import its type and pass it to implementWorkerExternal
export { getFibonacci };
