// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, expect, it } from "vitest";
import { CalculatorWorker } from "./testHelpers/CalculatorWorker.js";

describe("ObjectWorker", () => {
    describe("obj", () => {
        it("should offer async variants of the original", async () => {
            const worker = new CalculatorWorker();
            expect(await worker.obj.plus(1, 2)).toBe(3);
        });
    });
});
