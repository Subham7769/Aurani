import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getResellerId } from "@/lib/auth";
import { Category } from "@prisma/client";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resellerId = await getResellerId();
  if (!resellerId) return NextResponse.json({ error: "Not a reseller" }, { status: 403 });

  const products = await db.product.findMany({
    where: { resellerId },
    include: {
      media: { orderBy: { order: "asc" }, take: 1 },
      postJobs: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resellerId = await getResellerId();
  if (!resellerId) return NextResponse.json({ error: "Not a reseller" }, { status: 403 });

  const body = await req.json();
  const { title, description, category, priceMin, priceMax, media } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!category || !Object.values(Category).includes(category)) {
    return NextResponse.json({ error: "Valid category is required" }, { status: 400 });
  }
  if (!priceMin || !priceMax || Number(priceMin) > Number(priceMax)) {
    return NextResponse.json({ error: "Valid price range is required" }, { status: 400 });
  }
  if (Array.isArray(media) && media.length > 10) {
    return NextResponse.json({ error: "Maximum 10 media files allowed" }, { status: 400 });
  }

  const product = await db.product.create({
    data: {
      resellerId,
      title: title.trim(),
      description: description?.trim() ?? "",
      category,
      priceMin,
      priceMax,
      status: "DRAFT",
      media: Array.isArray(media)
        ? {
            create: media.map(
              (m: { cloudinaryUrl: string; cloudinaryPublicId: string; mediaType: "IMAGE" | "VIDEO" }, i: number) => ({
                cloudinaryUrl: m.cloudinaryUrl,
                cloudinaryPublicId: m.cloudinaryPublicId,
                mediaType: m.mediaType,
                order: i,
              }),
            ),
          }
        : undefined,
    },
    include: { media: true },
  });

  return NextResponse.json(product, { status: 201 });
}
