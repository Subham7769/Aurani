import type { Job } from "bullmq";
import { db } from "@/lib/db";
import { syncProductToCatalog } from "@/lib/whatsapp/catalog";
import type { PublishJobPayload } from "../producer";

export async function processCatalogSync(job: Job<PublishJobPayload>) {
  const { productId, resellerId } = job.data;

  const [product, reseller] = await Promise.all([
    db.product.findUnique({
      where: { id: productId },
      include: { media: { orderBy: { order: "asc" }, take: 1 } },
    }),
    db.reseller.findUnique({ where: { id: resellerId } }),
  ]);

  if (!product || !reseller) throw new Error("Product or reseller not found");

  if (!reseller.whatsappAccessToken || !reseller.whatsappCatalogId) {
    await db.postJob.updateMany({
      where: { productId, platform: "WHATSAPP_CATALOG" },
      data: { status: "NOT_CONFIGURED", attemptedAt: new Date() },
    });
    return;
  }

  const imageUrl = product.media[0]?.cloudinaryUrl ?? "";
  const priceInPaise = Math.round(Number(product.priceMin) * 100);

  try {
    await syncProductToCatalog(reseller.whatsappCatalogId, reseller.whatsappAccessToken, {
      name: product.title,
      description: product.description,
      price: priceInPaise,
      currency: "INR",
      imageUrl,
      retailerId: productId,
      availability: "in stock",
    });

    await db.postJob.updateMany({
      where: { productId, platform: "WHATSAPP_CATALOG" },
      data: { status: "SUCCESS", attemptedAt: new Date() },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await db.postJob.updateMany({
      where: { productId, platform: "WHATSAPP_CATALOG" },
      data: { status: "FAILED", errorMessage: message, attemptedAt: new Date() },
    });
    throw err; // re-throw so BullMQ retries
  }
}
