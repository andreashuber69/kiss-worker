import type { MethodsOnlyObject } from "./MethodsOnlyObject.js";

export class ObjectDescriptor<T extends MethodsOnlyObject<T>> {
    public constructor(ctor: new () => T) {
        this.methodNames = Object.getOwnPropertyNames(ctor.prototype) as Array<keyof T>;
    }

    public readonly methodNames: ReadonlyArray<keyof T>;
}

export const getObjectDescriptor = <T extends MethodsOnlyObject<T>>(ctor: new () => T) => new ObjectDescriptor<T>(ctor);
