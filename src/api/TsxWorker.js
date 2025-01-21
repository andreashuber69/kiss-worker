// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md

import { workerData } from "node:worker_threads";
// This is an optional peer dependency. If the worker script does not end in "ts", this script is never executed.
// eslint-disable-next-line import/no-extraneous-dependencies
import { tsImport } from "tsx/esm/api";

void tsImport(workerData.tsxWorkerFilename, import.meta.url);
