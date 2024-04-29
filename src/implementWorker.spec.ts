// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { assert, describe, expect, it } from "vitest";
import { DelayWorker } from "./testHelpers/DelayWorker.js";
import { FunnyWorker } from "./testHelpers/FunnyWorker.js";
import { GetFibonacciWorker } from "./testHelpers/GetFibonacciWorker.js";
import { WrongFilenameWorker } from "./testHelpers/WrongFilenameWorker.js";

const isExpected = (result: PromiseSettledResult<void>) =>
    (result.status === "rejected") && (result.reason instanceof Error) && result.reason.message === "Hmmm";

const delay = async () => await new Promise((resolve) => setTimeout(resolve, 200));

describe("KissWorker", () => {
    describe("execute", () => {
        it("should sequentially execute multiple calls", async () => {
            const worker = new GetFibonacciWorker();
            const results = await Promise.all([...new Array(10).keys()].map(async (n) => await worker.execute(n)));
            const expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
            expect(results.every((value, index) => value === expected[index])).toBe(true);
        });

        it("should await async func", async () => {
            const worker = new DelayWorker();
            const expectedElapsed = Math.random() * 1000;
            const start = Date.now();
            await worker.execute(expectedElapsed);
            expect(Date.now() - start >= expectedElapsed).toBe(true);
        });

        it("should throw after terminate()", async () => {
            const worker = new DelayWorker();
            worker.terminate();
            worker.terminate(); // Should be safe to call multiple times

            await expect(async () => await worker.execute(3)).rejects.toThrow(
                new Error("The worker has been terminated."),
            );
        });

        it("should throw when func throws", async () => {
            const worker = new FunnyWorker();
            const execute = async () => await worker.execute("throw");
            const results = await Promise.allSettled([...new Array(3).keys()].map(async () => await execute()));
            expect(results.every((result) => isExpected(result))).toBe(true);
        });

        it("should throw when the worker file is not a valid script", async () => {
            const worker = new WrongFilenameWorker();

            await expect(async () => await worker.execute()).rejects.toThrow(
                new Error("The specified worker file is not a valid script."),
            );
        });

        it("should throw when func calls postMessage", async () => {
            const worker = new FunnyWorker();

            await expect(async () => await worker.execute("post")).rejects.toThrow(
                new Error("func called postMessage, which is not allowed."),
            );
        });

        it("should throw for exceptions thrown outside of func", async () => {
            const worker = new FunnyWorker();

            try {
                await worker.execute("throwOutside");
                assert(false);
            } catch (error: unknown) {
                assert(error instanceof Error);
                expect(error.message.split("\n")[0]).toBe("Exception thrown outside of func:");
            }

            // Wait for func to return so that the console output always appears.
            await delay();
        });

        it("should log delayed exceptions to the console", async () => {
            const worker = new FunnyWorker();
            await worker.execute("throwDelayed");
            // Wait for the error handler to be called so that the console output always appears.
            await delay();
        });
    });
});
