import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getResellerId } from "@/lib/auth";
import { enqueuePublishJobs } from "@/lib/queue/producer";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resellerId = await getResellerId();
  if (!resellerId) return NextResponse.json({ error: "Not a reseller" }, { status: 403 });

  const product = await db.product.findUnique({
    where: { id },
    include: {
      reseller: true,
      media: { orderBy: { order: "asc" }, take: 1 },
    },
  });

  if (!product || product.resellerId !== resellerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!product.reseller.isActive) {
    return NextResponse.json({ error: "Account suspended" }, { status: 403 });
  }

  // Get selected WhatsApp groups
  const groups = await db.whatsAppGroup.findMany({
    where: { resellerId, isSelected: true },
  });

  // Create PostJob rows (PENDING) and update product status
  await db.$transaction([
    db.product.update({
      where: { id },
      data: { status: "ACTIVE", publishedAt: new Date() },
    }),
    // Delete any existing post jobs for this product
    db.postJob.deleteMany({ where: { productId: id } }),
    // Catalog job
    db.postJob.create({
      data: {
        productId: id,
        platform: "WHATSAPP_CATALOG",
        status: product.reseller.whatsappAccessToken ? "PENDING" : "NOT_CONFIGURED",
      },
    }),
    // Group broadcast jobs
    ...groups.map((g: typeof groups[number]) =>
      db.postJob.create({
        data: {
          productId: id,
          platform: `WHATSAPP_GROUP_${g.groupId}`,
          status: "PENDING",
        },
      }),
    ),
  ]);

  // Enqueue BullMQ jobs (non-blocking)
  if (product.reseller.whatsappAccessToken) {
    await enqueuePublishJobs({ productId: id, resellerId, groupIds: groups.map((g: typeof groups[number]) => g.groupId) });
  }

  return NextResponse.json({ queued: true }, { status: 202 });
}
