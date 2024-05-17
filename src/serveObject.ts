// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { getAllPropertyNames } from "./getAllPropertyNames.js";
import type { implementObjectWorkerExternal } from "./implementObjectWorkerExternal.js";
import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";
import type { WorkerSignature } from "./Signature.js";

// Code coverage is not reported for code executed within a worker, because only the original (uninstrumented)
// version of the code is ever loaded.
/* istanbul ignore next -- @preserve */
const handleMessage = async <C extends new (...args: never[]) => T, T extends MethodsOnlyObject<T> = InstanceType<C>>(
    ctor: C,
    obj: T | undefined,
    { data }: MessageEvent<Parameters<WorkerSignature<C, T>>>,
) => {
    try {
        if (data[0] === "construct") {
            const [, ...args2] = data;
            const newObj = new ctor(...args2);
            postMessage({ type: "result", result: getAllPropertyNames(newObj) });
            return newObj;
        } else if (data[0] === "call") {
            const [, methodName, ...args] = data;

            // We cannot know whether the called method is synchronous or asynchronous, we therefore must always
            // await the result.
            postMessage({ type: "result", result: await obj?.[methodName](...args) });
            return obj;
        }

        postMessage({ type: "error", error: new Error("Client code made a prohibited call to Worker.postMessage.") });
        return obj;
    } catch (error: unknown) {
        postMessage({ type: "error", error });
        return obj;
    }
};

/* istanbul ignore next -- @preserve */
/**
 * Calls `ctor` and serves the returned object on a worker thread such that its methods can be called from
 * the thread calling {@linkcode implementObjectWorkerExternal}.
 * @description This function must only be called from code executing on a worker thread, see example in the
 * {@linkcode implementObjectWorkerExternal} documentation.
 * @param ctor The constructor function of the worker object to serve.
 */
export const serveObject = <C extends new (...args: never[]) => T, T extends MethodsOnlyObject<T> = InstanceType<C>>(
    ctor: C,
) => {
    let obj: T | undefined;

    const handleMessageWithObject =
        // This is not a race condition because the the obj variable changes its value only exactly once and client code
        // has no sensible way of triggering new messages before the first message has been fully processed.
        // eslint-disable-next-line require-atomic-updates
        async (ev: MessageEvent<Parameters<WorkerSignature<C, T>>>) => (obj = await handleMessage(ctor, obj, ev));

    addEventListener(
        "message",
        (ev: MessageEvent<Parameters<WorkerSignature<C, T>>>) => void handleMessageWithObject(ev),
    );
};
