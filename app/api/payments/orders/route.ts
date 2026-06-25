import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getResellerId } from "@/lib/auth";
import { createOrderWithSplit } from "@/lib/razorpay/orders";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resellerId = await getResellerId();
  if (!resellerId) return NextResponse.json({ error: "Not a reseller" }, { status: 403 });

  const body = await req.json();
  const { productId, customerPhone, customerName, amount } = body;

  if (!productId || !customerPhone || !amount) {
    return NextResponse.json({ error: "productId, customerPhone, and amount are required" }, { status: 400 });
  }

  const [product, reseller] = await Promise.all([
    db.product.findUnique({ where: { id: productId }, select: { id: true, resellerId: true } }),
    db.reseller.findUnique({
      where: { id: resellerId },
      select: { razorpayAccountId: true, commissionRate: true },
    }),
  ]);

  if (!product || product.resellerId !== resellerId) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (!reseller?.razorpayAccountId) {
    return NextResponse.json(
      { error: "Link your Razorpay account in Settings before creating payment links" },
      { status: 422 },
    );
  }

  const amountInPaise = Math.round(Number(amount) * 100);
  const { orderId, paymentLinkUrl } = await createOrderWithSplit({
    amountInPaise,
    resellerRazorpayAccountId: reseller.razorpayAccountId,
    commissionRate: Number(reseller.commissionRate),
    productId,
    customerPhone,
  });

  const order = await db.order.create({
    data: {
      productId,
      resellerId,
      customerPhone,
      customerName: customerName ?? null,
      amount,
      razorpayOrderId: orderId,
      razorpayPaymentLinkId: null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ orderId: order.id, paymentLinkUrl }, { status: 201 });
}
