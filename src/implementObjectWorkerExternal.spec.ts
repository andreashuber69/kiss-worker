// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import { describe, expect, it } from "vitest";
import { createCalculatorWorkerExternal } from "./testHelpers/createCalculatorWorkerExternal.ts";

describe("ObjectWorker", () => {
    describe("obj", () => {
        it("should offer async variants of the original", async () => {
            const worker = await createCalculatorWorkerExternal();
            expect(await worker.obj.add(1, 2)).toBe(3);
            expect(await worker.obj.subtract(7, 4)).toBe(3);
        });
    });
});
