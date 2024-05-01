// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
// See https://github.com/microsoft/TypeScript/issues/13298#issuecomment-1610361208
type UnionToIntersection<U> = (U extends never ? never : (arg: U) => never) extends (arg: infer I) => void ? I : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnionToTuple<T, A extends any[] = []> =
    UnionToIntersection<T extends never ? never : (t: T) => T> extends
    (_: never) => infer W ? UnionToTuple<Exclude<T, W>, [...A, W]> : A;
