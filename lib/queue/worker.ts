import { Worker } from "bullmq";
import { processCatalogSync } from "./jobs/catalog-sync";
import { processGroupBroadcast } from "./jobs/group-broadcast";

const connection = { url: process.env.REDIS_URL! };

const catalogWorker = new Worker("catalog-sync", processCatalogSync, {
  connection,
  concurrency: 5,
});

const broadcastWorker = new Worker("group-broadcast", processGroupBroadcast, {
  connection,
  concurrency: 10,
});

catalogWorker.on("failed", (job, err) => {
  console.error(`[catalog-sync] job ${job?.id} failed:`, err.message);
});

broadcastWorker.on("failed", (job, err) => {
  console.error(`[group-broadcast] job ${job?.id} failed:`, err.message);
});

console.log("BullMQ workers started — catalog-sync, group-broadcast");

process.on("SIGTERM", async () => {
  await catalogWorker.close();
  await broadcastWorker.close();
});
