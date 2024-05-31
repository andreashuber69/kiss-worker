// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, it } from "vitest";
import { Worker } from "./index.ts";

describe("Worker", () => {
    describe("constructor", () => {
        it("should load a js file without error", async () => {
            const worker = new Worker(new URL("testHelpers/bounce.js", import.meta.url), { type: "module" });

            await new Promise((resolve, reject) => {
                setTimeout(resolve, 300);
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                worker.addEventListener("error", (ev) => reject(ev));
            });

            worker.terminate();
        });
    });
});
