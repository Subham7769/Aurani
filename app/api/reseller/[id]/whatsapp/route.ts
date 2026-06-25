import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getResellerId } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resellerId = await getResellerId();
  if (!resellerId || resellerId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { whatsappPhone } = await req.json();

  if (!whatsappPhone?.trim()) {
    return NextResponse.json({ error: "WhatsApp number is required" }, { status: 400 });
  }

  await db.reseller.update({
    where: { id: resellerId },
    data: { whatsappPhone: whatsappPhone.replace(/\D/g, "") },
  });

  return NextResponse.json({ updated: true });
}
