import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getResellerId } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; mediaId: string }> },
) {
  const { id, mediaId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resellerId = await getResellerId();
  if (!resellerId) return NextResponse.json({ error: "Not a reseller" }, { status: 403 });

  const product = await db.product.findUnique({ where: { id } });
  if (!product || product.resellerId !== resellerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.productMedia.delete({ where: { id: mediaId, productId: id } });

  return NextResponse.json({ deleted: true });
}
