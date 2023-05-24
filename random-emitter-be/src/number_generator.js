const { parentPort, workerData } = require('node:worker_threads');

setInterval(() => {
  parentPort.postMessage(Math.floor(Math.random() * (workerData.range + 1)));
}, workerData.interval);