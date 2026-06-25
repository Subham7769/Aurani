import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendTextMessage } from "@/lib/whatsapp/broadcast";
import type { ShiprocketWebhookPayload } from "@/lib/shiprocket/webhooks";

export async function POST(req: Request) {
  const payload = await req.json() as ShiprocketWebhookPayload;

  const { awb, current_status, tracking_url } = payload;
  if (!awb) return NextResponse.json({ received: true });

  const shipment = await db.shipment.findFirst({
    where: { awbCode: awb },
    include: {
      order: {
        include: {
          reseller: {
            select: {
              whatsappPhoneNumberId: true,
              whatsappAccessToken: true,
            },
          },
        },
      },
    },
  });

  if (!shipment) return NextResponse.json({ received: true });

  await db.shipment.update({
    where: { id: shipment.id },
    data: {
      status: current_status,
      trackingUrl: tracking_url ?? shipment.trackingUrl,
    },
  });

  // Notify customer via WhatsApp
  const { whatsappPhoneNumberId, whatsappAccessToken } = shipment.order.reseller;
  if (whatsappPhoneNumberId && whatsappAccessToken) {
    try {
      const { decrypt } = await import("@/lib/crypto");
      const token = decrypt(whatsappAccessToken);
      const trackLink = tracking_url ? `\nTrack here: ${tracking_url}` : "";
      await sendTextMessage(
        whatsappPhoneNumberId,
        token,
        shipment.order.customerPhone,
        `📦 Your order status: *${current_status}*${trackLink}`,
      );
    } catch {
      // Non-critical
    }
  }

  return NextResponse.json({ received: true });
}
