// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, expect, it } from "vitest";
import { FibonacciWorker } from "./FibonacciWorker.js";
import { ThrowingWorker } from "./ThrowingWorker.js";

const terminatedError = new Error("The worker has been terminated.");

describe("FibonacciWorker", () => {
    it("should sequentially execute all calls", async () => {
        const worker = new FibonacciWorker();
        const results = await Promise.all([...new Array(10).keys()].map(async (n) => await worker.execute(n)));
        const expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
        expect(results.every((value, index) => value === expected[index])).toBe(true);
    });

    it("should throw after terminate()", async () => {
        const worker = new FibonacciWorker();
        worker.terminate();
        worker.terminate(); // Should be safe to call multiple times
        await expect(async () => await worker.execute(3)).rejects.toThrow(terminatedError);
    });
});

describe("ThrowingWorker", () => {
    it("should throw for every call", async () => {
        const worker = new ThrowingWorker();
        const results = await Promise.allSettled([...new Array(3).keys()].map(async () => await worker.execute()));
        expect(results.every(({ status }) => status === "rejected")).toBe(true);
        worker.terminate();
        await expect(async () => await worker.execute()).rejects.toThrow(terminatedError);
    });
});
