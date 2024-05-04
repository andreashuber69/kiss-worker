// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, expect, it } from "vitest";
import { createFibonacciWorkerExternal } from "./testHelpers/createFibonacciWorkerExternal.js";

describe("FunctionWorker", () => {
    describe("execute", () => {
        it("should sequentially execute multiple calls", async () => {
            const worker = createFibonacciWorkerExternal();
            const results = await Promise.all([...new Array(10).keys()].map(async (n) => await worker.execute(n)));
            const expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
            expect(results.every((value, index) => value === expected[index])).toBe(true);
        });
    });
});
