import { requireResellerId } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { CreateOrderButton } from "@/components/dashboard/create-order-button";
import type { OrderRow } from "@/components/dashboard/orders-table";

export const metadata = { title: "Orders — Aurani Dashboard" };

export default async function OrdersPage() {
  const resellerId = await requireResellerId();

  const reseller = await db.reseller.findUnique({
    where: { id: resellerId },
    select: { razorpayAccountId: true },
  });

  const [orders, products] = await Promise.all([
    db.order.findMany({
      where: { resellerId },
      include: { product: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.product.findMany({
      where: { resellerId, status: "ACTIVE" },
      select: { id: true, title: true },
    }),
  ]);

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    product: o.product.title,
    customer: `${o.customerName ?? ""}${o.customerPhone ? ` (${o.customerPhone})` : ""}`.trim() || o.customerPhone,
    amount: o.amount.toString(),
    status: o.status,
    paymentLink: "—",
    date: new Date(o.createdAt).toLocaleDateString("en-IN"),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Orders</h2>
          <p className="mt-1 font-sans text-sm text-muted-foreground">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        {reseller?.razorpayAccountId ? (
          <CreateOrderButton products={products} />
        ) : (
          <p className="font-sans text-xs text-muted-foreground">
            Add Razorpay details in Settings to generate payment links
          </p>
        )}
      </div>

      <OrdersTable rows={rows} />
    </div>
  );
}
