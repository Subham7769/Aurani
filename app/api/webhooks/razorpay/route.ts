import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay/webhooks";
import { sendTextMessage } from "@/lib/whatsapp/broadcast";

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });

  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const payload = await req.text();

  if (!verifyRazorpaySignature(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as {
    event: string;
    payload: {
      payment?: {
        entity: {
          id: string;
          order_id: string;
          amount: number;
          notes?: Record<string, string>;
        };
      };
    };
  };

  const paymentEntity = event.payload.payment?.entity;
  if (!paymentEntity) return NextResponse.json({ received: true });

  const { event: eventType } = event;

  if (eventType === "payment.captured") {
    const order = await db.order.findFirst({
      where: { razorpayOrderId: paymentEntity.order_id },
      include: {
        reseller: {
          select: {
            commissionRate: true,
            whatsappPhoneNumberId: true,
            whatsappAccessToken: true,
          },
        },
      },
    });

    if (!order) return NextResponse.json({ received: true });

    // Idempotency check
    const existing = await db.payment.findFirst({
      where: { razorpayPaymentId: paymentEntity.id },
    });
    if (existing) return NextResponse.json({ received: true });

    const totalAmount = paymentEntity.amount / 100;
    const commissionRate = Number(order.reseller.commissionRate);
    const commissionAmount = totalAmount * commissionRate;
    const resellerAmount = totalAmount - commissionAmount;

    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      }),
      db.payment.create({
        data: {
          orderId: order.id,
          razorpayPaymentId: paymentEntity.id,
          commissionAmount,
          resellerAmount,
          status: "CAPTURED",
        },
      }),
    ]);

    // WhatsApp order confirmation to customer
    const { whatsappPhoneNumberId, whatsappAccessToken } = order.reseller;
    if (whatsappPhoneNumberId && whatsappAccessToken) {
      try {
        const { decrypt } = await import("@/lib/crypto");
        const token = decrypt(whatsappAccessToken);
        await sendTextMessage(
          whatsappPhoneNumberId,
          token,
          order.customerPhone,
          `✅ Payment confirmed! Your order has been received. Amount: ₹${totalAmount.toFixed(0)}. We'll reach out shortly with shipping details.`,
        );
      } catch {
        // Non-critical — don't fail webhook
      }
    }
  } else if (eventType === "payment.failed") {
    const order = await db.order.findFirst({
      where: { razorpayOrderId: paymentEntity.order_id },
    });
    if (order) {
      await db.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    }
  }

  return NextResponse.json({ received: true });
}
