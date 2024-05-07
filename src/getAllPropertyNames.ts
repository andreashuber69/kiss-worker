const getAllPropertyNamesImpl = (obj: unknown): string[] => {
    if (obj && obj !== Object.prototype) {
        return [
            ...Object.getOwnPropertyNames(obj).filter((v) => v !== "constructor"),
            ...getAllPropertyNamesImpl(Object.getPrototypeOf(obj)),
        ];
    }

    return [];
};

export const getAllPropertyNames = (obj: unknown) => [...new Set(getAllPropertyNamesImpl(obj))];
