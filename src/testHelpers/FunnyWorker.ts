// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { implementWorker } from "../implementWorker.js";

const doFunnyThings = async (what: "post" | "throw" | "throwDelayed" | "throwOutside") => {
    switch (what) {
        case "post":
            postMessage("It's sunny outside");
            break;
        case "throw":
            throw new Error("Hmmm");
        case "throwOutside":
            setTimeout(() => {
                throw new Error("It's sunny outside");
            });

            await new Promise((resolve) => setTimeout(resolve, 100));
            break;
        case "throwDelayed":
            setTimeout(() => {
                throw new Error("The time bomb has exploded.");
            }, 100);

            break;
        default:
            break;
    }
};

export const FunnyWorker =
    implementWorker(() => new Worker(new URL("FunnyWorker.js", import.meta.url), { type: "module" }), doFunnyThings);
