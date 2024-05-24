// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementObjectWorker, Worker } from "../index.js";

class Bouncer {
    public bounce(message: string) {
        return message;
    }
}

const maliciousWorkerFactory = () => {
    const result = new Worker(new URL("createMisbehavedWorker.js", import.meta.url), { type: "module" });
    // False positive
    // eslint-disable-next-line unicorn/require-post-message-target-origin
    result.postMessage("Ouch!");
    return result;
};

export const createMisbehavedWorker = implementObjectWorker(maliciousWorkerFactory, Bouncer);
