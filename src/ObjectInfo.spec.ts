// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, expect, it } from "vitest";
import { ObjectInfo } from "./ObjectInfo.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
declare class Empty {}

declare class Large {
    public method00(): void;
    public method01(): void;
    public method02(): void;
    public method03(): void;
    public method04(): void;
    public method05(): void;
    public method06(): void;
    public method07(): void;
    public method08(): void;
    public method09(): void;
    public method10(): void;
    public method11(): void;
    public method12(): void;
    public method13(): void;
    public method14(): void;
    public method15(): void;
    public method16(): void;
    public method17(): void;
    public method18(): void;
    public method19(): void;
    public method20(): void;
    public method21(): void;
    public method22(): void;
    public method23(): void;
    public method24(): void;
    public method25(): void;
    public method26(): void;
    public method27(): void;
    public method28(): void;
    public method29(): void;
    public method30(): void;
    public method31(): void;
    public method32(): void;
    public method33(): void;
    public method34(): void;
    public method35(): void;
    public method36(): void;
    public method37(): void;
    public method38(): void;
    public method39(): void;
    public method40(): void;
    public method41(): void;
    public method42(): void;
    public method43(): void;
    public method44(): void;
    public method45(): void;
    public method46(): void;
    public method47(): void;
    public method48(): void;
    public method49(): void;
}

describe("ObjectInfo", () => {
    it("should work with an empty class", () => {
        expect(new ObjectInfo<typeof Empty>().methodNames.length).toBe(0);
    });

    it("should work with a large class", () => {
        const info = new ObjectInfo<typeof Large>(
            "method00",
            "method01",
            "method02",
            "method03",
            "method04",
            "method05",
            "method06",
            "method07",
            "method08",
            "method09",
            "method10",
            "method11",
            "method12",
            "method13",
            "method14",
            "method15",
            "method16",
            "method17",
            "method18",
            "method19",
            "method20",
            "method21",
            "method22",
            "method23",
            "method24",
            "method25",
            "method26",
            "method27",
            "method28",
            "method29",
            "method30",
            "method31",
            "method32",
            "method33",
            "method34",
            "method35",
            "method36",
            "method37",
            "method38",
            "method39",
            "method40",
            "method41",
            "method42",
            "method43",
            "method44",
            "method45",
            "method46",
            "method47",
            "method48",
            "method49",
        );

        expect(info.methodNames.length).toBe(50);
    });
});
