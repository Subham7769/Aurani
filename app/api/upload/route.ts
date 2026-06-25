import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateUploadSignature } from "@/lib/cloudinary";
import { getResellerId } from "@/lib/auth";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resellerId = await getResellerId();
  if (!resellerId) {
    return NextResponse.json({ error: "Reseller account not found" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const mediaType = searchParams.get("type") as "image" | "video" | null;

  if (mediaType !== "image" && mediaType !== "video") {
    return NextResponse.json(
      { error: "Query param `type` must be 'image' or 'video'" },
      { status: 400 },
    );
  }

  const result = generateUploadSignature(resellerId, mediaType);
  return NextResponse.json(result);
}
