import type { Job } from "bullmq";
import { db } from "@/lib/db";
import { sendImageMessage } from "@/lib/whatsapp/broadcast";
import type { PublishJobPayload } from "../producer";

interface GroupBroadcastPayload extends PublishJobPayload {
  groupId: string;
}

export async function processGroupBroadcast(job: Job<GroupBroadcastPayload>) {
  const { productId, resellerId, groupId } = job.data;
  const platform = `WHATSAPP_GROUP_${groupId}`;

  const [product, reseller] = await Promise.all([
    db.product.findUnique({
      where: { id: productId },
      include: { media: { orderBy: { order: "asc" }, take: 1 } },
    }),
    db.reseller.findUnique({ where: { id: resellerId } }),
  ]);

  if (!product || !reseller) throw new Error("Product or reseller not found");

  if (!reseller.whatsappAccessToken || !reseller.whatsappPhoneNumberId) {
    await db.postJob.updateMany({
      where: { productId, platform },
      data: { status: "NOT_CONFIGURED", attemptedAt: new Date() },
    });
    return;
  }

  const imageUrl = product.media[0]?.cloudinaryUrl ?? "";
  const caption = `*${product.title}*\n₹${product.priceMin}${product.priceMin !== product.priceMax ? ` – ₹${product.priceMax}` : ""}\n\nReply to order or ask questions.`;

  try {
    await sendImageMessage({
      phoneNumberId: reseller.whatsappPhoneNumberId,
      accessToken: reseller.whatsappAccessToken,
      to: groupId,
      imageUrl,
      caption,
    });

    await db.postJob.updateMany({
      where: { productId, platform },
      data: { status: "SUCCESS", attemptedAt: new Date() },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await db.postJob.updateMany({
      where: { productId, platform },
      data: { status: "FAILED", errorMessage: message, attemptedAt: new Date() },
    });
    throw err;
  }
}
