// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// eslint-disable-next-line import/no-default-export, import/no-anonymous-default-export
export default defineConfig({
    plugins: [
        dts({
            rollupTypes: true,
            tsconfigPath: "./src/tsconfig.json",
        }),
    ],
    build: {
        lib: {
            entry: ["./src/index.ts"],
            fileName: "index",
            formats: ["es"],
        },
        rollupOptions: {
            input: {
                index: "./src/index.ts",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TsxWorker: "./src/api/TsxWorker.js",
            },
        },
        sourcemap: true,
        outDir: "./dist/node",
        ssr: true,
    },
});
