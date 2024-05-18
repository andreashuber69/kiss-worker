// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { serveObject } from "kiss-worker";

class Calculator {
    public add(left: number, right: number) {
        return left + right;
    }

    public subtract(left: number, right: number) {
        return left - right;
    }
}

serveObject(Calculator);

export type { Calculator };
