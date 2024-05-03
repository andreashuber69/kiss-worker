// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { serveObject } from "../serveObject.js";

class CalculatorExternal {
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

serveObject(CalculatorExternal);

export type { CalculatorExternal };
