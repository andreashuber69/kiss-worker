// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import { describe, expect, it } from "vitest";
import { createCalculatorWorker } from "./testHelpers/createCalculatorWorker.ts";
import { createMisbehavedWorker } from "./testHelpers/createMisbehavedWorker.ts";
import { createThrowingWorker } from "./testHelpers/createThrowingWorker.ts";

describe("ObjectWorker", () => {
    describe("factory function", () => {
        it("should throw when constructor throws", async () => {
            await expect(async () => await createThrowingWorker(true)).rejects.toThrow(
                new Error("Oopsie in constructor."),
            );
        });

        it("should throw when worker factory calls Worker.postMessage", async () => {
            await expect(async () => await createMisbehavedWorker()).rejects.toThrow(
                new Error("Client code made a prohibited call to Worker.postMessage."),
            );
        });
    });

    describe("obj", () => {
        it("should offer async variants of the original", async () => {
            const worker = await createCalculatorWorker();
            expect(await worker.obj.multiply(3n, 8n)).toBe(24n);
            expect(await worker.obj.divide(42n, 6n)).toBe(7n);
            worker.terminate();
        });

        describe("method", () => {
            it("should throw when the original method throws", async () => {
                const worker = await createThrowingWorker(false);

                await expect(async () => await worker.obj.throw()).rejects.toThrow(
                    new Error("Oopsie in method."),
                );
            });
        });
    });
});
