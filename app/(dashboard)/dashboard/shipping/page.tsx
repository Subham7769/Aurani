import { requireResellerId } from "@/lib/auth";
import { db } from "@/lib/db";
import { ShippingTable } from "@/components/dashboard/shipping-table";
import { CreateShipmentButton } from "@/components/dashboard/create-shipment-button";
import type { ShipmentRow } from "@/components/dashboard/shipping-table";

export const metadata = { title: "Shipping — Aurani Dashboard" };

export default async function ShippingPage() {
  const resellerId = await requireResellerId();

  const paidOrders = await db.order.findMany({
    where: { resellerId, status: "PAID", shipment: null },
    include: { product: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  const shipments = await db.shipment.findMany({
    where: { order: { resellerId } },
    include: { order: { include: { product: { select: { title: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const rows: ShipmentRow[] = shipments.map((s) => ({
    id: s.id,
    orderId: s.orderId,
    product: s.order.product.title,
    awb: s.awbCode ?? "—",
    status: s.status,
    label: s.labelUrl ?? "—",
    tracking: s.trackingUrl ?? "—",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Shipping</h2>
          <p className="mt-1 font-sans text-sm text-muted-foreground">
            {paidOrders.length} paid order{paidOrders.length !== 1 ? "s" : ""} awaiting shipment
          </p>
        </div>
        {paidOrders.length > 0 && (
          <CreateShipmentButton
            orders={paidOrders.map((o) => ({ id: o.id, title: o.product.title }))}
          />
        )}
      </div>

      {rows.length > 0 ? (
        <ShippingTable rows={rows} />
      ) : (
        <p className="font-sans text-sm text-muted-foreground">No shipments yet.</p>
      )}
    </div>
  );
}
