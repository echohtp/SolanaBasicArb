
import "dotenv/config";
import { Worker } from 'worker_threads';
import path from 'path';

const TRADE_PAIRS =[
  ["SOL", "BONK"],
]

const NUM_WORKERS = TRADE_PAIRS.length;

function spawnWorker(id: number) {
  const worker = new Worker(path.join(__dirname, 'worker.js'), {
    workerData: { workerId: id, tradePair: TRADE_PAIRS[id]}
  });

  worker.on('message', (message) => {
    console.log(`Main: Message from Worker ${id}:`, message);
  });

  worker.on('error', (error) => {
    console.error(`Main: Error from Worker ${id}:`, error);
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Main: Worker ${id} stopped with exit code ${code}`);
      console.log(`Main: Respawning Worker ${id}`);
      spawnWorker(id);
    }
  });
}

for (let i = 0; i < NUM_WORKERS; i++) {
  spawnWorker(i);
}
