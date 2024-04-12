// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, expect, it } from "vitest";
import { FibonacciWorker } from "./FibonacciWorker.js";
import { ThrowingWorker } from "./ThrowingWorker.js";

describe("implementWorker", () => {
    it("should correctly implement a non-throwing worker", async () => {
        const worker = new FibonacciWorker();
        const results = await Promise.all([...new Array(10).keys()].map(async (n) => await worker.execute(n)));
        const expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
        expect(results.every((value, index) => value === expected[index])).toBe(true);
    });

    it("should correctly implement a throwing worker", async () => {
        const worker = new ThrowingWorker();

        try {
            await worker.execute();
            expect(false).toBe(true);
        } catch (error: unknown) {
            console.log(error);
            expect(true).toBe(true);
        }
    });
});
