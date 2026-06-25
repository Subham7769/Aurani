import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getRole } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getRole();
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { commissionRate, isActive } = body;

  if (commissionRate !== undefined) {
    const rate = Number(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 0.5) {
      return NextResponse.json({ error: "Commission rate must be 0–0.5" }, { status: 400 });
    }
  }

  const reseller = await db.reseller.findUnique({ where: { id } });
  if (!reseller) return NextResponse.json({ error: "Reseller not found" }, { status: 404 });

  const updated = await db.reseller.update({
    where: { id },
    data: {
      ...(commissionRate !== undefined && { commissionRate }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(updated);
}
