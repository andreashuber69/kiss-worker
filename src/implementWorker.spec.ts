// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, expect, it } from "vitest";
import { FibonacciWorker } from "./FibonacciWorker.js";

describe("implementWorker", () => {
    it("should return whatever", async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const myWorker = new FibonacciWorker();
        expect(await myWorker.execute(1) === 1).toBe(true);
    });
});
