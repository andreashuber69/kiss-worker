// https://www.npmjs.com/package/@preact/preset-vite
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const config = defineConfig({
    plugins: [
        dts({
            include: ["./src"],
            rollupTypes: true,
            tsconfigPath: "./src/tsconfig.json",
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "./src/index.ts"),
            fileName: "index",
            formats: ["es"],
        },
        sourcemap: true,
    },
});

// eslint-disable-next-line import/no-default-export
export default config;
