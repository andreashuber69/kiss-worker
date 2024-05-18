// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { implementFunctionWorkerExternal } from "./implementFunctionWorkerExternal.js";
import type { serveFunction } from "./serveFunction.js";

/**
 * Supplies information to {@linkcode implementFunctionWorkerExternal} about the type of the function being served with
 * {@linkcode serveFunction}.
 * @description The whole purpose of {@linkcode implementFunctionWorkerExternal} is that the script running on the
 * worker thread is never loaded anywhere else. Towards that end, said script should not export anything except the
 * **type** of the function being served. That type is then passed to {@linkcode implementFunctionWorkerExternal}
 * through an object of this class.
 * @typeParam T The type of the function being served with {@linkcode serveFunction}.
 */
export class FunctionInfo<T extends (..._: never[]) => unknown> {
    public constructor() {
        this.#doesNothing();
    }

    #doesNothing(): T | undefined {
        return undefined;
    }
}
