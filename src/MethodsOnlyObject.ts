// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

/**
 * Constrains `T` to only declare methods.
 * @template T The type of the object to be constrained to containing only methods.
 * @description The primary purpose of a worker is to provide a way to offload CPU-bound work onto a separate thread.
 * The interface of a type supporting such a use case often looks quite different from one that runs code that does not
 * hog the CPU. While the latter might have a well balanced mixture of fields, getters, setters and (mutating) methods,
 * the former generally does not. Instead, such a type usually only declares state-less methods, which get all their
 * data through parameters and provide their results through an appropriate return value. Therefore, the added
 * complexity of providing transparent access to fields, getters and setters is probably not worth the effort. For the
 * rare cases where such access is desired, it can easily be provided through get and set methods.
 */
export type MethodsOnlyObject<T> = Record<keyof T, (..._: never[]) => unknown>;
