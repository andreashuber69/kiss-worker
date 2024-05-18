const addEventListenerLocal = addEventListener;
const postMessageLocal = postMessage;
const WorkerLocal = Worker;

export { addEventListenerLocal as addEventListener, postMessageLocal as postMessage, WorkerLocal as Worker };
