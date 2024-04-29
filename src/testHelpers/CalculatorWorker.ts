// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementObjectWorker } from "../implementObjectWorker.js";

export class Calculator {
    public plus(a: number, b: number) {
        return a + b;
    }

    public unaryPlus(a: number) {
        return a;
    }

    public async stringify(a: number) {
        return await Promise.resolve(`${a}`);
    }
}

export const CalculatorWorker = implementObjectWorker(
    () => new Worker(new URL("CalculatorWorker.js", import.meta.url), { type: "module" }),
    Calculator,
);
