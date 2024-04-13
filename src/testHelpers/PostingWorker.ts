import { implementWorker } from "../implementWorker.js";

const post = () => postMessage("Whatever");

export const PostingWorker = implementWorker(() => new Worker(new URL(import.meta.url), { type: "module" }), post);
