// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, expect, it } from "vitest";

import { PromiseQueue } from "./PromiseQueue.js";

const delay = async (sequence: number[], result: number) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
    sequence.push(result);
    return result;
};

const throwError = async (id: number) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 10));
    throw new Error(`${id}`);
};

describe(PromiseQueue.name, () => {
    it("should create and await awaitables in order", async () => {
        try {
            const queue = new PromiseQueue();
            const sequence = new Array<number>();
            const promises = new Array<Promise<number>>();

            promises.push(
                queue.execute(async () => await delay(sequence, 0)),
                queue.execute(async () => await delay(sequence, 1)),
                queue.execute(async () => await delay(sequence, 2)),
            );

            await new Promise((resolve) => setTimeout(resolve, 150));
            const id1 = Math.random() * 1000;
            const throwErrorPromise1 = queue.execute(async () => await throwError(id1));

            promises.push(
                queue.execute(async () => await delay(sequence, 3)),
                queue.execute(async () => await delay(sequence, 4)),
                queue.execute(async () => await delay(sequence, 5)),
            );

            try {
                await throwErrorPromise1;
            } catch (error: unknown) {
                expect(error instanceof Error && error.message === `${id1}`).toBe(true);
            }

            const id2 = Math.random() * 1000;

            try {
                await queue.execute(async () => await throwError(id2));
            } catch (error: unknown) {
                expect(error instanceof Error && error.message === `${id2}`).toBe(true);
            }

            for (const [index, value] of (await Promise.all(promises)).entries()) {
                expect(index === value).toBe(true);
                expect(index === sequence[index]).toBe(true);
            }
        } catch (error: unknown) {
            console.log(error);
        }
    });
});
