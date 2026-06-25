import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface ClerkUserPayload {
  id: string;
  email_addresses: { email_address: string; primary: boolean }[];
  public_metadata: { role?: "ADMIN" | "RESELLER" | "CUSTOMER" };
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();

  const wh = new Webhook(webhookSecret);
  let evt: { type: string; data: ClerkUserPayload };

  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof evt;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = evt;

  if (type === "user.created" || type === "user.updated") {
    const primaryEmail = data.email_addresses.find((e) => e.primary)?.email_address
      ?? data.email_addresses[0]?.email_address;

    if (!primaryEmail) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    const role = data.public_metadata?.role ?? "CUSTOMER";

    const user = await db.user.upsert({
      where: { clerkId: data.id },
      create: { clerkId: data.id, email: primaryEmail, role },
      update: { email: primaryEmail, role },
    });

    if (type === "user.created" && role === "RESELLER") {
      await db.reseller.upsert({
        where: { userId: user.id },
        create: { userId: user.id, commissionRate: 0, isActive: false },
        update: {},
      });
    }
  }

  return NextResponse.json({ received: true });
}
