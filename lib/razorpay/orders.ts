import { getRazorpayClient } from "./client";

export interface CreateOrderParams {
  amountInPaise: number;
  resellerRazorpayAccountId: string;
  commissionRate: number; // decimal e.g. 0.10 for 10%
  productId: string;
  customerPhone: string;
}

export interface RazorpayOrderResult {
  orderId: string;
  paymentLinkUrl: string;
}

export async function createOrderWithSplit(
  params: CreateOrderParams,
): Promise<RazorpayOrderResult> {
  const rz = getRazorpayClient();
  const resellerAmount = Math.floor(params.amountInPaise * (1 - params.commissionRate));

  const order = await rz.orders.create({
    amount: params.amountInPaise,
    currency: "INR",
    transfers: [
      {
        account: params.resellerRazorpayAccountId,
        amount: resellerAmount,
        currency: "INR",
        notes: {
          productId: params.productId,
          customerPhone: params.customerPhone,
        },
      },
    ],
  } as Parameters<typeof rz.orders.create>[0]);

  // Create a payment link for easy sharing
  const link = await rz.paymentLink.create({
    amount: params.amountInPaise,
    currency: "INR",
    order_id: order.id,
    description: `Order for product ${params.productId}`,
    customer: { contact: params.customerPhone },
    notify: { sms: false, email: false },
    reminder_enable: false,
  } as Parameters<typeof rz.paymentLink.create>[0]);

  return {
    orderId: order.id,
    paymentLinkUrl: (link as unknown as { short_url: string }).short_url,
  };
}
