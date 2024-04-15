// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, expect, it } from "vitest";
import { FibonacciWorker } from "./testHelpers/FibonacciWorker.js";
import { FunnyWorker } from "./testHelpers/FunnyWorker.js";

const isExpected = (result: PromiseSettledResult<void>) =>
    (result.status === "rejected") && (result.reason instanceof Error) && result.reason.message === "Hmmm";

describe("KissWorker", () => {
    describe("execute", () => {
        it("should sequentially execute multiple calls", async () => {
            const worker = new FibonacciWorker();
            const results = await Promise.all([...new Array(10).keys()].map(async (n) => await worker.execute(n)));
            const expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
            expect(results.every((value, index) => value === expected[index])).toBe(true);
        });

        it("should throw after terminate()", async () => {
            const worker = new FibonacciWorker();
            worker.terminate();
            worker.terminate(); // Should be safe to call multiple times

            await expect(async () => await worker.execute(3)).rejects.toThrow(
                new Error("The worker has been terminated."),
            );
        });

        it("should throw when the worker function throws", async () => {
            const worker = new FunnyWorker();
            const execute = async () => await worker.execute("throw");
            const results = await Promise.allSettled([...new Array(3).keys()].map(async () => await execute()));
            expect(results.every((result) => isExpected(result))).toBe(true);
        });

        it("should throw when the worker function calls postMessage", async () => {
            const worker = new FunnyWorker();

            await expect(async () => await worker.execute("post")).rejects.toThrow(
                new Error("The worker function called postMessage, which is not allowed."),
            );
        });

        it("should throw for exceptions thrown outside of the worker function", async () => {
            const worker = new FunnyWorker();

            await expect(async () => await worker.execute("throwOutside")).rejects.toThrow(
                // eslint-disable-next-line @stylistic/max-len
                new Error("Argument deserialization failed or exception thrown outside of the worker function, see console for details."),
            );
        });

        it("should log delayed exceptions to the console", async () => {
            const worker = new FunnyWorker();
            await worker.execute("throwDelayed");
        });
    });
});
