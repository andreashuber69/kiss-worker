import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";
import type { UnionToTuple } from "./UnionToTuple.js";

export class ObjectInfo<T extends MethodsOnlyObject<T>> {
    public constructor(...methodNames: UnionToTuple<keyof T>) {
        // Apparently TS cannot not detect the types in the tuple correctly and assumes unknown, which is why we have
        // to cast here.
        this.methodNames = methodNames as ReadonlyArray<keyof T>;
    }

    public readonly methodNames: ReadonlyArray<keyof T>;
}
