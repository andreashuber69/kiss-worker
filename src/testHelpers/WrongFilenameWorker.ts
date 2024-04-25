// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementWorker } from "../implementWorker.js";

export const WrongFilenameWorker =
    implementWorker(() => new Worker(new URL("Oops.js", import.meta.url), { type: "module" }), () => undefined);
