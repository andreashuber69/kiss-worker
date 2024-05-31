// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { defineConfig } from "vite";

// eslint-disable-next-line import/no-default-export, import/no-anonymous-default-export
export default defineConfig({
    build: {
        lib: {
            entry: ["./src/index.ts"],
            fileName: "index",
            formats: ["es"],
        },
        outDir: "./dist/node",
        rollupOptions: {
            input: {
                index: "./src/index.ts",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                TsxWorker: "./src/api/TsxWorker.js",
            },
        },
        sourcemap: true,
        ssr: true,
    },
});
