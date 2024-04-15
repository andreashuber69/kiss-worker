// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// eslint-disable-next-line import/no-default-export, import/no-anonymous-default-export
export default defineConfig({
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
