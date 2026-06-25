import { Queue } from "bullmq";

function getConnection() {
  return { url: process.env.REDIS_URL! };
}

function getQueue(name: string) {
  return new Queue(name, { connection: getConnection() });
}

export interface PublishJobPayload {
  productId: string;
  resellerId: string;
  groupIds: string[];
}

export async function enqueuePublishJobs(payload: PublishJobPayload) {
  const catalogQueue = getQueue("catalog-sync");
  const broadcastQueue = getQueue("group-broadcast");

  await catalogQueue.add("catalog-sync", payload, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  });

  for (const groupId of payload.groupIds) {
    await broadcastQueue.add(
      "group-broadcast",
      { ...payload, groupId },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );
  }
}
