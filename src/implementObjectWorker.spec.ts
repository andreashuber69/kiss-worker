// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, expect, it } from "vitest";
import { createCalculatorWorker } from "./testHelpers/createCalculatorWorker.js";

describe("ObjectWorker", () => {
    describe("obj", () => {
        it("should offer async variants of the original", async () => {
            const worker = await createCalculatorWorker();
            expect(await worker.obj.multiply(3n, 8n)).toBe(24n);
            expect(await worker.obj.divide(42n, 6n)).toBe(7n);
            worker.terminate();
        });
    });
});
