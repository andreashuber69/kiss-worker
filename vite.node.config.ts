// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import path from "node:path";
import { globSync } from "glob";
import { defineConfig } from "vite";

const entryPoints = ["src/index.ts", "src/api/TsxWorker.js", "src/*.spec.ts"];

// eslint-disable-next-line import/no-default-export, import/no-anonymous-default-export
export default defineConfig({
    build: {
        lib: {
            entry: ["src/index.ts", "src/*.spec.ts"],
            formats: ["es"],
        },
        outDir: "dist/node",
        rollupOptions: {
            input: Object.fromEntries(
                globSync(entryPoints).map((file) => [path.basename(file, path.extname(file)), file]),
            ),
        },
        sourcemap: true,
        ssr: true,
    },
});
