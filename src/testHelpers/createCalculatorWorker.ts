// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementObjectWorker } from "../implementObjectWorker.js";

export class Calculator {
    public add(left: number, right: number) {
        return left + right;
    }

    public subtract(left: number, right: number) {
        return left - right;
    }

    public async format(num: number) {
        return await Promise.resolve(`${num}`);
    }
}

export const createCalculatorWorker = implementObjectWorker(
    () => new Worker(new URL("createCalculatorWorker.js", import.meta.url), { type: "module" }),
    Calculator,
);