// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { serve } from "../serve.js";

const getFibonacci = (n: number): number => ((n < 2) ? Math.floor(n) : getFibonacci(n - 1) + getFibonacci(n - 2));

serve(getFibonacci);

export type GetFibonacci = typeof getFibonacci;
