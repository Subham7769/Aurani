import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getResellerId } from "@/lib/auth";
import { createShipment } from "@/lib/shiprocket/shipments";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resellerId = await getResellerId();
  if (!resellerId) return NextResponse.json({ error: "Not a reseller" }, { status: 403 });

  const body = await req.json();
  const {
    orderId,
    customerName,
    customerAddress,
    customerCity,
    customerState,
    customerPincode,
    weight,
    length,
    breadth,
    height,
    pickupLocation,
  } = body;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { product: { select: { title: true } } },
  });

  if (!order || order.resellerId !== resellerId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "PAID") {
    return NextResponse.json({ error: "Only PAID orders can be shipped" }, { status: 422 });
  }

  const result = await createShipment({
    resellerId,
    orderId,
    orderNumber: `AUR-${orderId.slice(-8).toUpperCase()}`,
    productName: order.product.title,
    customerName: customerName ?? order.customerName ?? "Customer",
    customerPhone: order.customerPhone,
    customerAddress,
    customerCity,
    customerState,
    customerPincode,
    weight,
    length,
    breadth,
    height,
    declaredValue: Number(order.amount),
    pickupLocation: pickupLocation ?? "Primary",
  });

  const shipment = await db.shipment.upsert({
    where: { orderId },
    create: {
      orderId,
      shiprocketOrderId: String(result.order_id),
      awbCode: result.awb_code ?? null,
      status: "BOOKED",
      labelUrl: result.label_url ?? null,
    },
    update: {
      shiprocketOrderId: String(result.order_id),
      awbCode: result.awb_code ?? null,
      status: "BOOKED",
      labelUrl: result.label_url ?? null,
    },
  });

  return NextResponse.json(shipment, { status: 201 });
}
