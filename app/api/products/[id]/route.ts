import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getResellerId } from "@/lib/auth";
const VALID_CATEGORIES = ["CLOTHING", "JEWELLERY", "HOME_ESSENTIALS"] as const;

async function getOwnedProduct(productId: string, resellerId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      media: { orderBy: { order: "asc" } },
      postJobs: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!product || product.resellerId !== resellerId) return null;
  return product;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resellerId = await getResellerId();
  if (!resellerId) return NextResponse.json({ error: "Not a reseller" }, { status: 403 });

  const product = await getOwnedProduct(id, resellerId);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(product);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resellerId = await getResellerId();
  if (!resellerId) return NextResponse.json({ error: "Not a reseller" }, { status: 403 });

  const existing = await getOwnedProduct(id, resellerId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, description, category, priceMin, priceMax, status, newMedia } = body;

  if (category && !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const updated = await db.product.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(category !== undefined && { category }),
      ...(priceMin !== undefined && { priceMin }),
      ...(priceMax !== undefined && { priceMax }),
      ...(status !== undefined && { status }),
    },
    include: { media: { orderBy: { order: "asc" } }, postJobs: true },
  });

  // Append new media items after existing ones
  if (Array.isArray(newMedia) && newMedia.length > 0) {
    const startOrder = existing.media.length;
    await db.productMedia.createMany({
      data: newMedia.map(
        (m: { cloudinaryUrl: string; cloudinaryPublicId: string; mediaType: string }, i: number) => ({
          productId: id,
          cloudinaryUrl: m.cloudinaryUrl,
          cloudinaryPublicId: m.cloudinaryPublicId,
          mediaType: m.mediaType as "IMAGE" | "VIDEO",
          order: startOrder + i,
        }),
      ),
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resellerId = await getResellerId();
  if (!resellerId) return NextResponse.json({ error: "Not a reseller" }, { status: 403 });

  const existing = await getOwnedProduct(id, resellerId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.product.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
