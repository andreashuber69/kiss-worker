import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";

export class ObjectInfo<T extends MethodsOnlyObject<T>> {
    public constructor(ctor: new () => T) {
        this.methodNames = Object.getOwnPropertyNames(ctor.prototype) as Array<keyof T>;
    }

    public readonly methodNames: ReadonlyArray<keyof T>;
}

export const getObjectInfo = <T extends MethodsOnlyObject<T>>(ctor: new () => T) => new ObjectInfo<T>(ctor);
