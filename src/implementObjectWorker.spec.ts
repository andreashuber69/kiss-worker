// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, expect, it } from "vitest";
import { createCalculatorWorker } from "./testHelpers/createCalculatorWorker.js";

describe("ObjectWorker", () => {
    describe("obj", () => {
        it("should offer async variants of the original", async () => {
            const worker = await createCalculatorWorker();
            expect(await worker.obj.add(1, 2)).toBe(3);
            expect(await worker.obj.subtract(7, 4)).toBe(3);
            expect(await worker.obj.format(17)).toBe("17");
            worker.terminate();
        });
    });
});
