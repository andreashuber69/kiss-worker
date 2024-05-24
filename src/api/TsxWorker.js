import { tsImport } from "tsx/esm/api";
import { workerData } from "node:worker_threads";

tsImport(workerData.tsxWorkerFilename, import.meta.url);
