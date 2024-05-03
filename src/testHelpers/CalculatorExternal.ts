// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { serveObject } from "../serveObject.js";

class CalculatorExternal {
    public addExternal(left: number, right: number) {
        return left + right;
    }

    public subtractExternal(left: number, right: number) {
        return left - right;
    }

    public async formatExternal(num: number) {
        return await Promise.resolve(`${num}`);
    }
}

serveObject(CalculatorExternal);

export type { CalculatorExternal };
