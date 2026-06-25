import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getResellerId } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";

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

  const {
    razorpayAccountId,
    shiprocketEmail,
    shiprocketPassword,
    telegramBotToken,
    telegramChatId,
    instagramAccessToken,
    instagramAccountId,
    facebookPageToken,
    facebookPageId,
  } = await req.json();

  const data: Record<string, unknown> = {};

  if (razorpayAccountId !== undefined) data.razorpayAccountId = razorpayAccountId;

  if (shiprocketEmail !== undefined) data.shiprocketEmail = shiprocketEmail;
  if (shiprocketPassword) {
    data.shiprocketPasswordEncrypted = encrypt(shiprocketPassword);
    data.shiprocketJwt = null;
    data.shiprocketJwtExpiresAt = null;
  }

  if (telegramBotToken) data.telegramBotToken = encrypt(telegramBotToken);
  if (telegramChatId !== undefined) data.telegramChatId = telegramChatId;

  if (instagramAccessToken) data.instagramAccessToken = encrypt(instagramAccessToken);
  if (instagramAccountId !== undefined) data.instagramAccountId = instagramAccountId;

  if (facebookPageToken) data.facebookPageToken = encrypt(facebookPageToken);
  if (facebookPageId !== undefined) data.facebookPageId = facebookPageId;

  await db.reseller.update({ where: { id }, data });

  return NextResponse.json({ updated: true });
}
