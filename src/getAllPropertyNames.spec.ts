// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import { describe, expect, it } from "vitest";

import { getAllPropertyNames } from "./getAllPropertyNames.ts";


describe("getAllPropertyNames", () => {
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    class Empty {}

    it("should return an empty array for an empty class", () => {
        expect(getAllPropertyNames(new Empty()).length).toBe(0);
    });

    class ContainsField {
        public readonly value = 0;
    }

    it("should return public fields", () => {
        expect(getAllPropertyNames(new ContainsField())).toStrictEqual(["value"]);
    });

    class ContainsMethod {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        public doIt() {}
    }

    it("should return public methods", () => {
        expect(getAllPropertyNames(new ContainsMethod())).toStrictEqual(["doIt"]);
    });

    class ContainsPrivateMethod {
        public constructor() {
            this.#doIt();
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        #doIt() {}
    }

    it("should not return private methods", () => {
        expect(getAllPropertyNames(new ContainsPrivateMethod())).toStrictEqual([]);
    });

    class Base {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        public doIt() {}
    }

    class Derived extends Base {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        public doSomethingElse() {}
    }

    it("should return methods from base classes", () => {
        expect(getAllPropertyNames(new Derived())).toStrictEqual(["doSomethingElse", "doIt"]);
    });

    class Override extends Base {
        public override doIt() {}
    }

    it("should return overridden methods only once", () => {
        expect(getAllPropertyNames(new Override())).toStrictEqual(["doIt"]);
    });
});
