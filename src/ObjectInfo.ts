// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import type { implementObjectWorkerExternal } from "./implementObjectWorkerExternal.js";
import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";
import type { serveObject } from "./serveObject.js";
import type { UnionToTuple } from "./UnionToTuple.js";

/**
 * Supplies information to {@linkcode implementObjectWorkerExternal} about the type of the object being served with
 * {@linkcode serveObject}.
 * @description The whole purpose of {@linkcode implementObjectWorkerExternal} is that the script running on the worker
 * thread is never loaded anywhere else. Towards that end, said script should not export anything except the **type** of
 * the object being served. However, {@linkcode implementObjectWorkerExternal} can only work as advertised if it knows
 * the method names of the object being served on the worker thread. Due to TypeScript design constraints, method names
 * cannot be extracted from a type at runtime and therefore have to be supplied by the user.
 * This class supports this process by ensuring that the supplied method names are always in sync with the method names
 * declared by the type. If they are not, the TS compiler will show an error.
 * @typeParam T The type of the object being served with {@linkcode serveObject}.
 */
export class ObjectInfo<T extends MethodsOnlyObject<T>> {
    /**
     * Creates a new {@linkcode ObjectInfo} object.
     * @description NOTE: Due to limitations of the currently used advanced TypeScript generics, the method names have
     * to be supplied in the order they were declared on the type.
     * @param methodNames The names of all the methods of `T`.
     */
    public constructor(...methodNames: UnionToTuple<keyof T>) {
        // Apparently TS cannot not detect the types in the tuple correctly and assumes unknown, which is why we have
        // to cast here.
        this.methodNames = methodNames as ReadonlyArray<keyof T>;
    }

    public readonly methodNames: ReadonlyArray<keyof T>;
}
