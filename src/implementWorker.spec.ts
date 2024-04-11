// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import assert from "node:assert";
import { describe, it } from "node:test";
import { implementWorker } from "./implementWorker.js";

await describe(implementWorker.name, async () => {
    await it("should return whatever", () => {
        assert(implementWorker() === "whatever");
    });
});
