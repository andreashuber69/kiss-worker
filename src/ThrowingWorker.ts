import { implementWorker } from "./implementWorker.js";

const throwException = () => {
    throw new Error("Hmmm");
};

export const ThrowingWorker =
    implementWorker(() => new Worker(new URL(import.meta.url), { type: "module" }), throwException);
